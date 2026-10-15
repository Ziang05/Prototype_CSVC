import { useEffect, useState } from 'react';
import { Edit3, PackageCheck, Plus, Save, Search, Tags, Trash2 } from 'lucide-react';
import { api } from './mockApi';

const emptyCategory = { originalId: '', id: '', name: '' };
const emptyAsset = { originalId: '', id: '', name: '', categoryId: '', departmentId: '', roomId: '', status: 'Đang sử dụng' };
const statuses = ['Đang sử dụng', 'Trong kho', 'Hỏng', 'Sửa chữa', 'Bảo trì', 'Cho mượn', 'Báo hỏng', 'Thanh lý'];

export default function DeviceManagement({ data, refresh }) {
  const [tab, setTab] = useState('categories');
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [assetForm, setAssetForm] = useState(emptyAsset);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const categories = data.deviceCategories || [];
  const assets = data.assets || [];
  const departments = data.departments || [];
  const rooms = (data.locations || []).flatMap((building) => building.floors.flatMap((floor) => floor.rooms.map((room) => ({
    id: room.id, label: `${building.name} / ${floor.name} / ${room.name}`,
  }))));
  const selectedCategory = categories.find((category) => category.id === categoryForm.originalId);
  const categoryName = (asset) => categories.find((category) => category.id === asset.categoryId)?.name || asset.category || 'Chưa phân loại';
  const departmentName = (asset) => departments.find((department) => department.id === asset.departmentId)?.name || asset.department || 'Chưa chọn phòng ban';
  const roomName = (asset) => rooms.find((room) => room.id === asset.roomId)?.label || asset.room || 'Chưa chọn vị trí';
  const search = query.trim().toLowerCase();
  const visibleCategories = categories.filter((category) => `${category.id} ${category.name}`.toLowerCase().includes(search));
  const visibleAssets = assets.filter((asset) => (!statusFilter || asset.status === statusFilter)
    && `${asset.id} ${asset.name} ${categoryName(asset)} ${departmentName(asset)} ${roomName(asset)} ${asset.status}`.toLowerCase().includes(search));

  useEffect(() => { refresh(); }, [refresh]);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setQuery('');
    setStatusFilter('');
    setError('');
    setNotice('');
  };
  const reset = () => {
    if (tab === 'categories') setCategoryForm(emptyCategory);
    else setAssetForm(emptyAsset);
    setError('');
    setNotice('');
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (tab === 'categories') await api.saveDeviceCategory(categoryForm);
      else await api.saveAsset(assetForm);
      await refresh();
      setCategoryForm(emptyCategory);
      setAssetForm(emptyAsset);
      setQuery('');
      setStatusFilter('');
      setNotice(tab === 'categories' ? 'Đã lưu loại thiết bị.' : 'Đã lưu thiết bị.');
    } catch (cause) {
      setError(cause.message || 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (item) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (tab === 'categories') {
        await api.deleteDeviceCategory(item.id);
        if (categoryForm.originalId === item.id) setCategoryForm(emptyCategory);
      } else {
        await api.deleteAsset(item.id);
        if (assetForm.originalId === item.id) setAssetForm(emptyAsset);
      }
      await refresh();
      setNotice(`Đã xóa ${item.name}.`);
    } catch (cause) {
      setError(cause.message || 'Không thể xóa. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };
  const edit = (item) => {
    if (tab === 'categories') setCategoryForm({ ...item, originalId: item.id });
    else setAssetForm({ ...emptyAsset, ...item, originalId: item.id });
    setError('');
    setNotice('');
  };

  return (
    <section className="screen">
      <div className="catalog-tabs" role="tablist" aria-label="Quản lý thiết bị">
        <button id="device-categories-tab" role="tab" aria-selected={tab === 'categories'} aria-controls="device-management-panel" className={tab === 'categories' ? 'active' : ''} disabled={busy} onClick={() => switchTab('categories')}><Tags size={17} />Quản lý loại thiết bị</button>
        <button id="device-assets-tab" role="tab" aria-selected={tab === 'assets'} aria-controls="device-management-panel" className={tab === 'assets' ? 'active' : ''} disabled={busy} onClick={() => switchTab('assets')}><PackageCheck size={17} />Quản lý thiết bị</button>
      </div>
      {error && <p className="location-error" role="alert">{error}</p>}
      {notice && <p className="location-notice" role="status">{notice}</p>}
      <div id="device-management-panel" role="tabpanel" aria-labelledby={tab === 'categories' ? 'device-categories-tab' : 'device-assets-tab'} className="split wide catalog-layout">
        <form className="panel request-form catalog-form" onSubmit={save}>
          <div className="panel-head">
            <h2>{tab === 'categories' ? `${categoryForm.originalId ? 'Sửa' : 'Thêm'} loại thiết bị` : `${assetForm.originalId ? 'Sửa' : 'Thêm'} thiết bị`}</h2>
            <button type="button" className="ghost-button" disabled={busy} onClick={reset}>Làm mới</button>
          </div>
          <fieldset className="location-fields" disabled={busy}>
            {tab === 'categories' ? <>
              <label>Mã loại thiết bị<input value={categoryForm.id} onChange={(event) => setCategoryForm({ ...categoryForm, id: event.target.value })} placeholder="Để trống để tạo tự động" /></label>
              <label>Tên loại thiết bị<input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="VD: Máy tính" /></label>
              <div className="form-grid two">
                <label>Tổng số lượng<input readOnly type="number" value={selectedCategory?.totalQuantity || 0} /></label>
                <label>Lượng tồn kho<input readOnly type="number" value={selectedCategory?.stockQuantity || 0} /></label>
              </div>
              <small>Số lượng tự cập nhật từ tồn kho và thiết bị ngoài kho. Loại mới có số lượng ban đầu bằng 0.</small>
            </> : <>
              <label>Mã thiết bị<input value={assetForm.id} onChange={(event) => setAssetForm({ ...assetForm, id: event.target.value })} placeholder="Để trống để tạo tự động" /></label>
              <label>Tên thiết bị<input required value={assetForm.name} onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })} placeholder="VD: Máy chiếu Epson" /></label>
              <label>Loại thiết bị<select aria-label="Loại thiết bị" value={assetForm.categoryId} onChange={(event) => setAssetForm({ ...assetForm, categoryId: event.target.value })}>
                <option value="">Chưa phân loại</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select></label>
              <label>Phòng ban quản lý<select aria-label="Phòng ban quản lý" value={assetForm.departmentId} onChange={(event) => setAssetForm({ ...assetForm, departmentId: event.target.value })}>
                <option value="">Chọn phòng ban</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select></label>
              <label>Vị trí<select aria-label="Vị trí" value={assetForm.roomId} onChange={(event) => setAssetForm({ ...assetForm, roomId: event.target.value })}>
                <option value="">Chọn tòa / tầng / phòng</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.label}</option>)}
              </select></label>
              <label>Tình trạng<select aria-label="Tình trạng" value={assetForm.status} onChange={(event) => setAssetForm({ ...assetForm, status: event.target.value })}>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select></label>
            </>}
          </fieldset>
          <button className="primary" type="submit" disabled={busy}><Save size={18} />{busy ? 'Đang xử lý…' : tab === 'categories' ? 'Lưu loại thiết bị' : 'Lưu thiết bị'}</button>
        </form>
        <div className="panel table-panel">
          <div className="catalog-header">
            <h2>{tab === 'categories' ? `Loại thiết bị (${visibleCategories.length})` : `Thiết bị (${visibleAssets.length})`}</h2>
            <button className="ghost-button" type="button" disabled={busy} onClick={reset}><Plus size={17} />{tab === 'categories' ? 'Thêm loại' : 'Thêm thiết bị'}</button>
          </div>
          <div className="user-filters">
            <div className="searchbox"><Search size={18} /><input aria-label="Tìm thiết bị hoặc loại thiết bị" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === 'categories' ? 'Tìm mã, tên loại…' : 'Tìm mã, tên, phòng ban, vị trí…'} /></div>
            {tab === 'assets' && <select aria-label="Lọc tình trạng" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Tất cả tình trạng</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>}
          </div>
          <div className="equipment-table-wrap">
            <table className={`equipment-table ${tab === 'assets' ? 'asset-management-table' : ''}`}>
              <thead><tr>{(tab === 'categories' ? ['Mã', 'Tên loại', 'Tổng số lượng', 'Lượng tồn kho', 'Thao tác'] : ['Mã', 'Tên thiết bị', 'Phòng ban quản lý', 'Vị trí', 'Tình trạng', 'Thao tác']).map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
              <tbody>
                {(tab === 'categories' ? visibleCategories : visibleAssets).map((item) => <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><strong>{item.name}</strong>{tab === 'assets' && <small>{categoryName(item)}</small>}</td>
                  {tab === 'categories' ? <><td>{item.totalQuantity || 0}</td><td>{item.stockQuantity || 0}</td></> : <><td>{departmentName(item)}</td><td>{roomName(item)}</td><td><span className="pill neutral">{item.status}</span></td></>}
                  <td><span className="row-actions">
                    <button type="button" aria-label={`Sửa ${item.name}`} disabled={busy} onClick={() => edit(item)}><Edit3 size={15} /></button>
                    <button className="danger" type="button" aria-label={`Xóa ${item.name}`} disabled={busy} onClick={() => remove(item)}><Trash2 size={15} /></button>
                  </span></td>
                </tr>)}
                {(tab === 'categories' ? visibleCategories : visibleAssets).length === 0 && <tr><td colSpan={tab === 'categories' ? 5 : 6}>Không có dữ liệu phù hợp.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
