import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api } from '../src/mockApi.js';

test('CRUD thiết bị giữ đúng liên kết loại, phòng ban, vị trí và số lượng tồn', async () => {
  const category = await api.saveDeviceCategory({ originalId: '', id: 'LOAI-THU', name: 'Loại thử' });
  const counts = async (id) => {
    const data = await api.getDashboard();
    const item = data.deviceCategories.find((category) => category.id === id);
    return [item.totalQuantity, item.stockQuantity];
  };
  assert.deepEqual(await counts(category.id), [0, 0]);
  const asset = await api.saveAsset({ name: 'Thiết bị thử', categoryId: category.id, departmentId: 'PB-002', roomId: 'A2.305', status: 'Trong kho' });
  assert.equal(asset.department, 'Phòng Đào tạo');
  assert.equal(asset.buildingId, 'TOA-A');
  assert.equal(asset.floorId, 'A-2');
  assert.deepEqual(await counts(category.id), [1, 1]);
  const edited = await api.saveAsset({ ...asset, originalId: asset.id, id: 'TB-DOI-MA', status: 'Sửa chữa' });
  assert.deepEqual(await counts(category.id), [1, 0]);
  const renamed = await api.saveDeviceCategory({ ...category, originalId: category.id, id: 'LOAI-MOI', name: 'Loại đã đổi tên' });
  const dashboard = await api.getDashboard();
  const savedAsset = dashboard.assets.find((item) => item.id === edited.id);
  assert.equal(savedAsset.categoryId, renamed.id);
  assert.equal(savedAsset.category, renamed.name);
  assert.deepEqual(await counts(renamed.id), [1, 0]);
  await api.saveAsset({ ...savedAsset, originalId: savedAsset.id, status: 'Trong kho' });
  assert.deepEqual(await counts(renamed.id), [1, 1]);
  await api.deleteAsset(savedAsset.id);
  assert.deepEqual(await counts(renamed.id), [0, 0]);
  const retained = await api.saveAsset({ name: 'Giữ lại khi xóa loại', categoryId: renamed.id });
  await api.deleteDeviceCategory(renamed.id);
  const after = await api.getDashboard();
  assert.ok(!after.deviceCategories.some((item) => item.id === renamed.id));
  assert.equal(after.assets.find((item) => item.id === retained.id).categoryId, '');
});

test('mã nhập trùng báo lỗi thay vì ghi đè thiết bị hoặc loại khác', async () => {
  await assert.rejects(api.saveDeviceCategory({ originalId: '', id: 'DM-TB-01', name: 'Không ghi đè' }), /đã tồn tại/);
  await assert.rejects(api.saveAsset({ id: 'TB-00041', name: 'Không ghi đè' }), /đã tồn tại/);
});
