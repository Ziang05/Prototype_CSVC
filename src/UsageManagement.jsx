import { useEffect, useState } from 'react';
import { Plus, Save, Search } from 'lucide-react';
import { WarehouseTicketDetail, WarehouseTicketList } from './WarehouseTickets';
import { getTicketGroups } from './warehouseTickets';
import { createUsageGroup, prepareUsageItems, toVietnamTimestamp } from './usageTickets';
import { EquipmentSelectionTable } from './TicketEquipmentTable';
import { prepareMaintenanceItems } from './maintenanceTickets';

export default function UsageManagement({ data, refresh, createTicket, actions, page = 'usage', onApprove }) {
  const isMaintenance = page === 'maintenance';
  const [operation, setOperation] = useState(actions[0].key);
  const [creating, setCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [form, setForm] = useState({});
  const [groups, setGroups] = useState(() => [createUsageGroup()]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [itemDetails, setItemDetails] = useState({});
  const action = actions.find((item) => item.key === operation);
  const tickets = data.tickets || [];
  const assets = data.assets || [];
  const categories = data.deviceCategories || [];
  const departments = data.departments || [];
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId && ticket.type === action.type);
  const lineItems = isMaintenance ? prepareMaintenanceItems(groups, assets, categories, itemDetails) : prepareUsageItems(groups, assets, categories);
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const changeItemDetail = (id, field, value) => setItemDetails((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));

  useEffect(() => { refresh(); }, [refresh]);

  const switchOperation = (key) => {
    setOperation(key);
    setCreating(false);
    setSelectedTicketId(null);
    setError('');
  };
  const openCreate = () => {
    setForm({ requester: action.requester, department: action.department, priority: 'Trung bình', note: '', reason: '', damageDescription: '', borrowAt: '', expectedReturnAt: '', maintenanceKind: 'Định kỳ', plannedAt: '', workDescription: '', warrantyReference: '' });
    setItemDetails({});
    setGroups([createUsageGroup()]);
    setQuery('');
    setError('');
    setSelectedTicketId(null);
    setCreating(true);
  };
  const selectCategory = (id, categoryId) => setGroups((current) => current.map((group) => group.id === id ? { ...group, categoryId, assetIds: [] } : group));
  const toggleAsset = (groupId, assetId) => {
    setError('');
    setGroups((current) => current.map((group) => group.id === groupId ? { ...group, assetIds: group.assetIds.includes(assetId) ? group.assetIds.filter((id) => id !== assetId) : [...group.assetIds, assetId] } : group));
  };
  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!lineItems.length) { setError('Chọn loại thiết bị và ít nhất một thiết bị bên trong để tạo phiếu.'); return; }
    setSaving(true);
    setError('');
    try {
      const grouped = getTicketGroups({ details: { lineItems } });
      const ticket = await createTicket(event, {
        ...form, type: action.type, lineItems, totalQuantity: lineItems.length,
        asset: grouped.map((group) => `${group.categoryName} - ${group.quantity}`).join(', '),
        borrowAt: toVietnamTimestamp(form.borrowAt),
        expectedReturnAt: toVietnamTimestamp(form.expectedReturnAt),
        plannedAt: toVietnamTimestamp(form.plannedAt),
      }, { keepOnPage: true });
      if (ticket) { setCreating(false); setSelectedTicketId(ticket.id); }
    } catch (cause) {
      setError(cause.message || 'Không thể tạo phiếu. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  return (
    <section className={`screen ${page}-screen`}>
      <div className="warehouse-operations usage-operations" role="tablist" aria-label={isMaintenance ? 'Nghiệp vụ bảo trì' : 'Nghiệp vụ sử dụng'}>
        {actions.map((item) => <button type="button" role="tab" id={`${page}-tab-${item.key}`} aria-selected={operation === item.key} aria-controls={`${page}-content`} className={operation === item.key ? 'active' : ''} key={item.key} disabled={saving} onClick={() => switchOperation(item.key)}><strong>{item.menuLabel}</strong><small>{tickets.filter((ticket) => ticket.type === item.type).length} phiếu</small></button>)}
      </div>
      {error && <p className="location-error" role="alert">{error}</p>}
      <div id={`${page}-content`} role="tabpanel" aria-labelledby={`${page}-tab-${operation}`}>
        {creating ? <form className="panel request-form" onSubmit={save}>
          <div className="panel-head"><h2>{action.title}</h2><button className="ghost-button" type="button" disabled={saving} onClick={() => { setCreating(false); setError(''); }}>Đóng</button></div>
          <fieldset className="location-fields" disabled={saving}>
            <div className="form-grid two">
              <label>{action.requesterLabel}{operation === 'transfer' ? <select aria-label={action.requesterLabel} value={form.requester} onChange={change('requester')}><option value="">Chọn phòng ban</option>{departments.map((department) => <option key={department.id}>{department.name}</option>)}</select> : <input value={form.requester} onChange={change('requester')} />}</label>
              <label>{action.departmentLabel}{isMaintenance ? <input aria-label={action.departmentLabel} value={form.department} onChange={change('department')} placeholder="Phòng ban hoặc đơn vị bên ngoài" /> : <select aria-label={action.departmentLabel} value={form.department} onChange={change('department')}><option value="">Chọn phòng ban</option>{departments.map((department) => <option key={department.id}>{department.name}</option>)}</select>}</label>
              {operation === 'borrow-return' && <><label>Thời gian mượn<input type="datetime-local" value={form.borrowAt} onInput={change('borrowAt')} onChange={change('borrowAt')} /></label><label>Dự kiến trả<input type="datetime-local" value={form.expectedReturnAt} onInput={change('expectedReturnAt')} onChange={change('expectedReturnAt')} /></label></>}
              {operation === 'transfer' && <label>Lý do điều chuyển<input value={form.reason} onChange={change('reason')} placeholder="Không bắt buộc" /></label>}
              {operation === 'damage-report' && <label>Mô tả hư hỏng<input value={form.damageDescription} onChange={change('damageDescription')} placeholder="VD: Không lên nguồn" /></label>}
              {isMaintenance && <>
                {operation === 'maintenance' && <label>Hình thức bảo trì<select aria-label="Hình thức bảo trì" value={form.maintenanceKind} onChange={change('maintenanceKind')}><option>Định kỳ</option><option>Đột xuất</option></select></label>}
                <label>Thời gian dự kiến<input type="datetime-local" value={form.plannedAt} onInput={change('plannedAt')} onChange={change('plannedAt')} /></label>
                <label>{operation === 'maintenance' ? 'Nội dung bảo trì' : operation === 'repair' ? 'Nội dung sửa chữa chung' : 'Nội dung bảo hành'}<input value={form.workDescription} onChange={change('workDescription')} placeholder="Nội dung công việc, không bắt buộc" /></label>
                {operation === 'warranty' && <label>Số phiếu / mã bảo hành<input value={form.warrantyReference} onChange={change('warrantyReference')} placeholder="Không bắt buộc" /></label>}
              </>}
              <label>Mức ưu tiên<select aria-label="Mức ưu tiên" value={form.priority} onChange={change('priority')}><option>Thấp</option><option>Trung bình</option><option>Cao</option></select></label>
              <label>Ghi chú<input value={form.note} onChange={change('note')} placeholder="Thông tin bổ sung, không bắt buộc" /></label>
            </div>
            <div className="panel-head"><h2>Loại thiết bị</h2><button className="primary" type="button" onClick={() => setGroups((current) => [...current, createUsageGroup()])}><Plus size={17} />Thêm loại thiết bị</button></div>
            <p className="form-helper">Chọn loại trước, sau đó tích chọn các thiết bị có sẵn. Số lượng tự cập nhật theo lựa chọn.</p>
            <div className="searchbox"><Search size={18} /><input aria-label="Tìm thiết bị để chọn" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, mã thiết bị hoặc mã vạch…" /></div>
            <EquipmentSelectionTable groups={groups} categories={categories} assets={assets} query={query}
              onCategoryChange={selectCategory} onToggleAsset={toggleAsset}
              onRemoveGroup={(id) => setGroups((current) => current.filter((group) => group.id !== id))}
              repair={isMaintenance && operation === 'repair'} itemDetails={itemDetails}
              onItemDetailChange={changeItemDetail} tickets={tickets} />
            <strong>Tổng cộng: {groups.filter((group) => group.assetIds.length).length} loại · {lineItems.length} thiết bị</strong>
          </fieldset>
          <button className="primary" type="submit" disabled={saving}><Save size={18} />{saving ? 'Đang tạo…' : 'Tạo phiếu'}</button>
        </form> : selectedTicket ? <WarehouseTicketDetail ticket={selectedTicket} action={action} departments={departments} assets={assets} categories={categories} onBack={() => setSelectedTicketId(null)} onApprove={onApprove} /> : <WarehouseTicketList key={operation} tickets={tickets} action={action} assets={assets} categories={categories} onSelect={setSelectedTicketId} onCreate={openCreate} searchLabel={isMaintenance ? 'Tìm phiếu bảo trì' : 'Tìm phiếu sử dụng'} />}
      </div>
    </section>
  );
}
