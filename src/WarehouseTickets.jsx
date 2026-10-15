import { useEffect, useState } from 'react';
import { ArrowLeft, ClipboardCheck, Eye, Plus, Search } from 'lucide-react';
import { filterWarehouseTickets, getTicketGroups, getTicketLineItems } from './warehouseTickets';

const display = (value) => value === undefined || value === null || value === '' ? 'Chưa khai báo' : value;
const tones = { 'Chờ duyệt': 'amber', 'Đã duyệt': 'green', 'Đã hủy': 'red', 'Cho phép': 'green', 'Từ chối': 'red', 'Cần xử lý': 'red', 'Đang xử lý': 'blue' };
const date = (value) => {
  if (!value) return 'Chưa ghi nhận';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Asia/Ho_Chi_Minh' }).format(parsed);
};
const Status = ({ value }) => <span className={`pill ${tones[value] || 'neutral'}`}>{value || 'Chưa ghi nhận'}</span>;

export function WarehouseTicketList({ tickets, action, assets = [], categories = [], onSelect, onCreate, searchLabel = 'Tìm phiếu kho' }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const filtered = filterWarehouseTickets(tickets, action.type, query, status);
  return (
    <div className="panel">
      <div className="catalog-header">
        <h2>Danh sách phiếu {action.type.toLowerCase()} ({filtered.length})</h2>
        <button className="primary" type="button" onClick={onCreate}><Plus size={17} />{action.actionLabel}</button>
      </div>
      <div className="user-filters">
        <div className="searchbox"><Search size={18} /><input aria-label={searchLabel} placeholder="Tìm mã phiếu, thiết bị, phòng ban, người tạo…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <select aria-label="Lọc trạng thái phiếu" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {[...new Set(tickets.filter((ticket) => ticket.type === action.type).map((ticket) => ticket.status))].map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      <div className="equipment-table-wrap">
        <table className="equipment-table warehouse-ticket-table">
          <thead><tr>{['Mã phiếu', 'Loại thiết bị / số lượng', action.requesterLabel, 'Người tạo', 'Ngày tạo', 'Trạng thái', 'Chi tiết'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
          <tbody>
            {filtered.map((ticket) => <tr key={ticket.id} className="warehouse-ticket-row" onClick={() => onSelect(ticket.id)}>
              <td><button className="ticket-code" type="button" aria-label={`Xem phiếu ${ticket.id}`}>{ticket.id}</button></td>
              <td><TicketDeviceGroups ticket={ticket} assets={assets} categories={categories} compact /></td>
              <td>{display(ticket.requester)}</td>
              <td>{display(ticket.createdBy)}</td>
              <td>{date(ticket.createdAt)}</td>
              <td><Status value={ticket.status} /></td>
              <td><button type="button" className="ghost-button" aria-label={`Xem chi tiết ${ticket.id}`}><Eye size={16} />Xem</button></td>
            </tr>)}
            {!filtered.length && <tr><td colSpan="7">Không có phiếu phù hợp. Chọn “{action.actionLabel}” để thêm phiếu.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WarehouseTicketDetail({ ticket, action, departments, assets = [], categories = [], onBack, onApprove }) {
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { setError(''); setNotice(''); }, [ticket.id]);
  const approve = async () => {
    if (approving) return;
    setApproving(true);
    setError('');
    setNotice('');
    try {
      await onApprove(ticket.id);
      setNotice(`Đã duyệt phiếu ${ticket.id}.`);
    } catch (err) {
      setError(err.message || 'Không thể duyệt phiếu. Vui lòng thử lại.');
    } finally {
      setApproving(false);
    }
  };
  const details = ticket.details || {};
  const items = getTicketLineItems(ticket);
  const isImport = ticket.type === 'Nhập kho';
  const relatedDepartment = departments.find((department) => department.id === details.requestDepartmentId)?.name;
  const fields = [
    ['Mã phiếu', ticket.id], ['Nghiệp vụ', ticket.type], ['Trạng thái phiếu', <Status value={ticket.status} />],
    ['Người tạo', display(ticket.createdBy)], ['Thời gian tạo', date(ticket.createdAt)], ['Mức ưu tiên', display(ticket.priority)],
    [action.requesterLabel, display(relatedDepartment || ticket.requester)], [action.departmentLabel, display(ticket.department)],
    ...(isImport ? [['Nhà cung cấp', display(details.supplier)], ['Đơn vị vận chuyển', display(details.carrier)], ['Mã phiếu yêu cầu', display(details.requestCode)], ['Ngày giao', date(details.deliveryDate)], ['Đợt giao', display(details.deliveryBatch)], ['Tổng số lượng', display(details.totalQuantity ?? (items.length || undefined))]] : []),
    ...(ticket.type === 'Thanh lý' ? [['Lý do thanh lý', display(details.reason)]] : []),
    ...(ticket.type === 'Mượn / Trả' ? [['Thời gian mượn', date(details.borrowAt)], ['Dự kiến trả', date(details.expectedReturnAt)]] : []),
    ...(ticket.type === 'Điều chuyển' ? [['Lý do điều chuyển', display(details.reason)]] : []),
    ...(ticket.type === 'Báo hỏng / Sửa chữa' ? [['Mô tả hư hỏng', display(details.damageDescription)]] : []),
    ...(['Bảo trì', 'Sửa chữa', 'Bảo hành'].includes(ticket.type) ? [
      ...(ticket.type === 'Bảo trì' ? [['Hình thức bảo trì', display(details.maintenanceKind)]] : []),
      ['Thời gian dự kiến', date(details.plannedAt)],
      ['Nội dung công việc', display(details.workDescription)],
      ...(ticket.type === 'Bảo hành' ? [['Số phiếu / mã bảo hành', display(details.warrantyReference)]] : []),
    ] : []),
    ['Ghi chú', display(details.note)],
  ];
  return (
    <section className="screen" aria-label={`Chi tiết phiếu ${ticket.id}`}>
      <div className="panel">
        <div className="catalog-header">
          <h2>Chi tiết phiếu {ticket.id}</h2>
          <div className="panel-actions">
            {onApprove && ticket.status === 'Chờ duyệt' && <button className="primary" type="button" disabled={approving} onClick={approve}><ClipboardCheck size={17} />{approving ? 'Đang duyệt…' : 'Duyệt phiếu'}</button>}
            <button className="ghost-button" type="button" onClick={onBack}><ArrowLeft size={17} />Quay lại danh sách</button>
          </div>
        </div>
        {error && <p className="location-error" role="alert">{error}</p>}
        {notice && <p className="location-notice" role="status">{notice}</p>}
        <dl className="ticket-info-grid">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
      <div className="panel">
        <h2>Danh sách loại thiết bị ({getTicketGroups(ticket, assets, categories).length})</h2>
        <p className="form-helper">Bấm vào từng loại để xem tên, mã thiết bị, mã vạch và thông tin xử lý bên trong.</p>
        <TicketDeviceGroups ticket={ticket} assets={assets} categories={categories} />
      </div>
      <div className="panel">
        <h2>Lịch sử xử lý</h2>
        {ticket.history?.length ? <ol className="ticket-timeline">{ticket.history.map((event, index) => <li key={index}><strong>{event.action}</strong><small>{event.actor} · {date(event.time)}</small></li>)}</ol> : <p>Chưa có lịch sử xử lý được ghi nhận.</p>}
      </div>
    </section>
  );
}

export function TicketDeviceGroups({ ticket, assets = [], categories = [], compact = false }) {
  const groups = getTicketGroups(ticket, assets, categories);
  const isImport = ticket.type === 'Nhập kho';
  const isBorrow = ticket.type === 'Mượn / Trả';
  return (
    <div className={`ticket-device-groups ${compact ? 'compact' : ''}`}>
      {!groups.length && <small>Chưa có thiết bị.</small>}
      {groups.map((group) => (
        <details className="ticket-device-group" key={group.key} onClick={(event) => event.stopPropagation()}>
          <summary>{group.categoryName} – {group.quantity}<small> thiết bị</small></summary>
          {compact ? <ul className="ticket-device-preview">{group.items.map((item, index) => <li key={`${item.assetId || 'item'}-${index}`}><strong>{display(item.name)}</strong><small>Mã vạch: {item.barcode || 'Chưa khai báo'}</small></li>)}</ul> : (
            <div className="equipment-table-wrap">
              <table className={`equipment-table ${isImport ? 'import-detail-table' : 'warehouse-detail-table'}`}>
                <thead><tr>{(isImport ? ['Tên thiết bị', 'Mã thiết bị', 'Mã vạch'] : ['Thiết bị / mã vạch', 'Số lượng', 'Thông tin duyệt', isBorrow ? 'Trạng thái mượn / trả' : 'Kết quả xử lý', 'Người tiếp nhận / thực hiện', 'Thời gian hoàn thành']).map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
                <tbody>{group.items.map((item, index) => <tr key={`${item.assetId || 'item'}-${index}`}>
                  {isImport ? <><td><strong>{display(item.name)}</strong></td><td>{display(item.assetId)}</td><td>{display(item.barcode)}</td></> : <>
                    <td><strong>{display(item.name || item.assetId)}</strong><small>Mã: {display(item.assetId)}</small><small>Mã vạch: {display(item.barcode)}</small>{item.repairRequest && <small>Yêu cầu sửa: {item.repairRequest}</small>}{item.relatedDamageTicketId && <small>Báo hỏng liên quan: {item.relatedDamageTicketId}</small>}</td>
                    <td>{display(item.quantity)}</td>
                    <td><Status value={item.approvalStatus} />{item.approvedBy && <small>Người duyệt: {item.approvedBy}</small>}{item.approvedAt && <small>{date(item.approvedAt)}</small>}</td>
                    <td>{(isBorrow ? item.loanStatus : item.repairStatus || item.result) || (isBorrow ? 'Chưa bắt đầu' : 'Chưa ghi nhận kết quả')}{item.resultDescription && <small>{item.resultDescription}</small>}{item.conditionOnReturn && <small>Tình trạng khi trả: {item.conditionOnReturn}</small>}{item.damageDescription && <small>{item.damageDescription}</small>}</td>
                    <td>{item.receiver || item.performer || 'Chưa ghi nhận'}{item.recordedBy && <small>Người ghi nhận: {item.recordedBy}</small>}</td>
                    <td>{date(item.completedAt || item.returnedAt)}</td>
                  </>}
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </details>
      ))}
    </div>
  );
}
