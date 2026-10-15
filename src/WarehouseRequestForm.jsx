import { useState } from 'react';
import { Plus, Save, Search } from 'lucide-react';
import { EquipmentSelectionTable } from './TicketEquipmentTable';
import { createUsageGroup } from './usageTickets';
import { getTicketGroups, getWarehouseAssets, prepareWarehouseItems } from './warehouseTickets';

export default function WarehouseRequestForm({ data, action, createTicket, onClose }) {
  const [form, setForm] = useState({ requester: action.requester, department: action.department, priority: 'Trung bình', reason: '', note: '' });
  const [groups, setGroups] = useState(() => [createUsageGroup()]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const assets = getWarehouseAssets(data.assets);
  const categories = (data.deviceCategories || []).filter((category) => assets.some((asset) => asset.categoryId === category.id));
  const lineItems = prepareWarehouseItems(groups, data.assets || [], categories);
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const selectCategory = (id, categoryId) => {
    setError('');
    setGroups((current) => current.map((group) => group.id === id ? { ...group, categoryId, assetIds: [] } : group));
  };
  const toggleAsset = (groupId, assetId) => {
    setError('');
    setGroups((current) => current.map((group) => group.id === groupId ? { ...group, assetIds: group.assetIds.includes(assetId) ? group.assetIds.filter((id) => id !== assetId) : [...group.assetIds, assetId] } : group));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!lineItems.length) {
      setError('Chọn loại và ít nhất một thiết bị trong kho để tạo phiếu.');
      return;
    }
    const selectedGroups = getTicketGroups({ details: { lineItems } });
    await createTicket(event, {
      ...form, type: action.type, lineItems, totalQuantity: lineItems.length,
      asset: selectedGroups.map((group) => `${group.categoryName} - ${group.quantity}`).join(', '),
    });
  };

  return (
    <form className="panel request-form" onSubmit={submit}>
      <div className="panel-head"><h2>{action.title}</h2><button className="ghost-button" type="button" onClick={onClose}>Đóng</button></div>
      <div className="form-grid two">
        <label>{action.requesterLabel}<select aria-label={action.requesterLabel} value={form.requester} onChange={change('requester')}><option value="">Chọn phòng ban</option>{(data.departments || []).map((department) => <option key={department.id}>{department.name}</option>)}</select></label>
        <label>{action.departmentLabel}<input value={form.department} onChange={change('department')} /></label>
        <label>Mức ưu tiên<select aria-label="Mức ưu tiên" value={form.priority} onChange={change('priority')}><option>Thấp</option><option>Trung bình</option><option>Cao</option></select></label>
        {action.key === 'liquidate' && <label>Lý do thanh lý<input value={form.reason} onChange={change('reason')} placeholder="Không bắt buộc" /></label>}
        <label>Ghi chú<input value={form.note} onChange={change('note')} placeholder="Thông tin bổ sung, không bắt buộc" /></label>
      </div>
      <div className="panel-head"><h2>Thiết bị có sẵn trong kho</h2><button className="primary" type="button" onClick={() => setGroups((current) => [...current, createUsageGroup()])}><Plus size={17} />Thêm loại thiết bị</button></div>
      <p className="form-helper">Chọn loại rồi tích chọn từng thiết bị đang trong kho. Số lượng tự cập nhật theo lựa chọn.</p>
      {!assets.length && <p>Kho chưa có thiết bị để chọn. Nhập thiết bị tại nghiệp vụ Nhập trước khi tạo phiếu.</p>}
      <div className="searchbox"><Search size={18} /><input aria-label="Tìm thiết bị trong kho" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, mã thiết bị hoặc mã vạch…" /></div>
      <EquipmentSelectionTable groups={groups} categories={categories} assets={assets} query={query}
        onCategoryChange={selectCategory} onToggleAsset={toggleAsset}
        onRemoveGroup={(id) => setGroups((current) => current.filter((group) => group.id !== id))} />
      <strong>Tổng cộng: {groups.filter((group) => group.assetIds.length).length} loại · {lineItems.length} thiết bị</strong>
      {error && <p className="location-error" role="alert">{error}</p>}
      <button className="primary" type="submit"><Save size={18} />Tạo phiếu</button>
    </form>
  );
}
