import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api, getDepartmentManagerIds } from '../src/mockApi.js';

test('tạo, sửa và bỏ nhiều người phụ trách bằng mã người dùng', async () => {
  const department = await api.saveDepartment({ name: 'Phòng thử', managerIds: ['ND-001', 'ND-002', 'ND-001'] });
  assert.deepEqual(department.managerIds, ['ND-001', 'ND-002']);
  const updated = await api.saveDepartment({ ...department, managerIds: ['ND-002', 'ND-008'] });
  assert.deepEqual(updated.managerIds, ['ND-002', 'ND-008']);
  const dashboard = await api.getDashboard();
  assert.deepEqual(dashboard.departments.find((item) => item.id === department.id).managerIds, ['ND-002', 'ND-008']);
  const user = dashboard.users.find((item) => item.id === 'ND-002');
  await api.saveUser({ ...user, name: 'Tên đã cập nhật' });
  const refreshed = await api.getDashboard();
  const names = getDepartmentManagerIds(updated, refreshed.users).map((id) => refreshed.users.find((item) => item.id === id)?.name);
  assert.deepEqual(names, ['Tên đã cập nhật', 'Võ Ngọc Mai']);
  const cleared = await api.saveDepartment({ ...updated, managerIds: [] });
  assert.deepEqual(cleared.managerIds, []);
});

test('chuyển người phụ trách dạng tên cũ sang mã người dùng', () => {
  const users = [{ id: 'ND-001', name: 'Nguyễn Văn Hòa' }];
  assert.deepEqual(getDepartmentManagerIds({ manager: 'Nguyễn Văn Hòa' }, users), ['ND-001']);
  assert.deepEqual(getDepartmentManagerIds({ manager: 'Nguyễn Văn Hòa', managerIds: [] }, users), []);
});
