import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { api, roles } from '../src/mockApi.js';

const server = await createServer({
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
});
after(() => server.close());
const { default: UserManagement } = await server.ssrLoadModule('/src/UserManagement.jsx');
const render = (data) => renderToString(createElement(UserManagement, { data, refresh: async () => {} }));

test('dữ liệu cũ chưa có users vẫn hiển thị trang và trạng thái tải', () => {
  const html = render({ departments: [] });
  assert.match(html, /Thêm người dùng/);
  assert.match(html, /Đang tải danh sách người dùng/);
  const saveButton = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0];
  assert.ok(saveButton);
  assert.doesNotMatch(saveButton, /disabled/);
});

test('dữ liệu mẫu đủ ba vai trò và hai trạng thái', async () => {
  const { users } = await api.getDashboard();
  assert.equal(users.length, 8);
  assert.deepEqual(new Set(users.map((user) => user.role)), new Set(roles));
  assert.ok(users.some((user) => user.locked));
  assert.ok(users.some((user) => !user.locked));
});

test('prototype lưu với họ tên, tự sinh tài khoản và cho phép thông tin thử', async () => {
  const user = await api.saveUser({ name: 'Người dùng thử' });
  assert.match(user.username, /^nguoidung\d+$/);
  assert.equal(user.departmentId, '');
  assert.equal(user.email, '');
  const edited = await api.saveUser({ ...user, username: 'Tên thử tự do', email: 'email thử', role: roles[2] });
  assert.equal(edited.username, 'Tên thử tự do');
  const duplicate = await api.saveUser({ name: 'Người dùng khác', username: edited.username, email: edited.email });
  assert.notEqual(duplicate.id, edited.id);
  assert.equal((await api.toggleUserLock(user.id)).locked, true);
  assert.equal((await api.saveUser({ ...edited, name: 'Đã sửa' })).locked, true);
});

test('danh sách null không làm trang bị trắng', () => {
  assert.match(render({ users: null, departments: null }), /Đang tải danh sách người dùng/);
});

test('danh sách rỗng hiển thị thông báo không có người dùng', () => {
  assert.match(render({ users: [], departments: [] }), /Không có người dùng phù hợp/);
});

test('dữ liệu đầy đủ hiển thị người dùng và các nút sửa, khóa', () => {
  const html = render({
    departments: [{ id: 'PB-001', name: 'Phòng CSVC' }],
    users: [{ id: 'ND-001', name: 'Người dùng thử', username: 'test', email: 'test@example.com', role: 'Nhân viên CSVC', departmentId: 'PB-001', locked: false }],
  });
  assert.match(html, /test@example.com/);
  assert.match(html, /Phòng CSVC/);
  assert.match(html, /aria-label="Sửa Người dùng thử"/);
  assert.match(html, /aria-label="Khóa Người dùng thử"/);
});
