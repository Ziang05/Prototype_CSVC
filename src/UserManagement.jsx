import { useEffect, useState } from 'react';
import { Edit3, Lock, Plus, Save, Search, Unlock } from 'lucide-react';
import { api, roles } from './mockApi';

const emptyUser = { id: '', name: '', username: '', email: '', departmentId: '', role: roles[1] };

export default function UserManagement({ data, refresh }) {
  const [form, setForm] = useState(emptyUser);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const users = Array.isArray(data?.users) ? data.users : [];
  const departments = Array.isArray(data?.departments) ? data.departments : [];
  const usersReady = Array.isArray(data?.users);

  useEffect(() => {
    let cancelled = false;
    refresh().catch(() => {
      if (!cancelled) setError('Không thể tải danh sách người dùng. Vui lòng bấm “Tải lại dữ liệu mẫu”.');
    });
    return () => { cancelled = true; };
  }, [refresh]);

  const departmentName = (id) => departments.find((department) => department.id === id)?.name || 'Chưa chọn phòng ban';
  const text = query.trim().toLocaleLowerCase('vi');
  const filtered = users.filter((user) => (
    (!roleFilter || user.role === roleFilter)
    && (!statusFilter || (statusFilter === 'locked') === user.locked)
    && `${user.name} ${user.username} ${user.email} ${departmentName(user.departmentId)}`.toLocaleLowerCase('vi').includes(text)
  ));
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const reset = () => { setForm(emptyUser); setError(''); setNotice(''); };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api.saveUser(form);
      await refresh();
      setForm(emptyUser);
      setQuery('');
      setRoleFilter('');
      setStatusFilter('');
      setNotice(form.id ? 'Đã cập nhật người dùng.' : 'Đã thêm người dùng.');
    } catch (cause) {
      setError(cause.message || 'Không thể lưu người dùng. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };
  const toggleLock = async (id) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const user = await api.toggleUserLock(id);
      await refresh();
      setNotice(`Đã ${user.locked ? 'khóa' : 'mở khóa'} người dùng ${user.name}.`);
    } catch (cause) {
      setError(cause.message || 'Không thể đổi trạng thái người dùng.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="screen">
      {error && <p className="location-error" role="alert">{error}</p>}
      {notice && <p className="location-notice" role="status">{notice}</p>}
      <div className="split wide catalog-layout">
        <form className="panel request-form catalog-form" onSubmit={save}>
          <div className="panel-head">
            <h2>{form.id ? 'Sửa người dùng' : 'Thêm người dùng'}</h2>
            <button className="ghost-button" type="button" onClick={reset} disabled={busy}>Làm mới</button>
          </div>
          <fieldset className="location-fields" disabled={busy}>
            <small>Chỉ cần nhập họ tên để lưu thử. Tên đăng nhập được tạo tự động nếu để trống; các thông tin còn lại có thể bổ sung sau.</small>
            <label>Họ và tên<input required value={form.name} onChange={change('name')} placeholder="Nhập họ và tên" /></label>
            <label>Tên đăng nhập<input value={form.username} onChange={change('username')} placeholder="Để trống để tạo tự động" /></label>
            <label>Email<input inputMode="email" value={form.email} onChange={change('email')} placeholder="Không bắt buộc" /></label>
            <label>Phòng ban<select aria-label="Phòng ban" value={form.departmentId} onChange={change('departmentId')}>
              <option value="">Chọn phòng ban</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select></label>
            <label>Vai trò<select aria-label="Vai trò" required value={form.role} onChange={change('role')}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select></label>
          </fieldset>
          <button className="primary" type="submit" disabled={busy}><Save size={18} />{busy ? 'Đang xử lý…' : 'Lưu người dùng'}</button>
        </form>

        <div className="panel table-panel">
          <div className="catalog-header">
            <h2>Danh sách người dùng ({filtered.length})</h2>
            <button className="ghost-button" type="button" onClick={reset} disabled={busy}><Plus size={17} />Thêm người dùng</button>
          </div>
          <div className="user-filters">
            <div className="searchbox">
              <Search size={18} />
              <input aria-label="Tìm người dùng" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, tài khoản, email, phòng ban…" />
            </div>
            <select aria-label="Lọc vai trò" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">Tất cả vai trò</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select aria-label="Lọc trạng thái" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>
          <div className="user-list">
            {!usersReady ? <p role="status">Đang tải danh sách người dùng…</p> : filtered.length === 0 && <p>Không có người dùng phù hợp.</p>}
            {filtered.map((user) => (
              <article className={`user-row ${user.locked ? 'is-locked' : ''}`} key={user.id}>
                <div className="user-details"><strong>{user.name}</strong><small>@{user.username}</small><small>{user.email || 'Chưa có email'}</small></div>
                <div className="user-details"><strong>{user.role}</strong><small>{departmentName(user.departmentId)}</small><small className={user.locked ? 'user-locked' : 'user-active'}>{user.locked ? 'Đã khóa' : 'Đang hoạt động'}</small></div>
                <div className="user-actions">
                  <button className="ghost-button" type="button" disabled={busy} aria-label={`Sửa ${user.name}`} onClick={() => { setForm({ ...user }); setError(''); setNotice(''); }}><Edit3 size={15} />Sửa</button>
                  <button className={user.locked ? 'primary' : 'user-lock-button'} type="button" disabled={busy} aria-label={`${user.locked ? 'Mở khóa' : 'Khóa'} ${user.name}`} onClick={() => toggleLock(user.id)}>
                    {user.locked ? <Unlock size={15} /> : <Lock size={15} />}{user.locked ? 'Mở khóa' : 'Khóa'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
