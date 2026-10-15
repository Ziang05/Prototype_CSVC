import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api } from '../src/mockApi.js';
import { createUsageGroup } from '../src/usageTickets.js';
import { getTicketGroups, getWarehouseAssets, prepareWarehouseItems } from '../src/warehouseTickets.js';

test('chỉ lấy thiết bị trong kho, bỏ thiết bị ngoài kho và đếm đúng khi bỏ chọn', async () => {
  const data = await api.getDashboard();
  const available = getWarehouseAssets(data.assets);
  assert.ok(available.some((asset) => asset.id === 'TV-001'));
  assert.ok(available.every((asset) => asset.status === 'Trong kho'));
  assert.ok(!available.some((asset) => asset.id === 'TB-00057'));
  const tv = { ...createUsageGroup(), categoryId: 'DM-TB-05', assetIds: ['TV-001', 'TV-002'] };
  const office = { ...createUsageGroup(), categoryId: 'DM-TB-03', assetIds: ['TB-00063'] };
  const outsideStock = { ...createUsageGroup(), categoryId: 'DM-TB-01', assetIds: ['TB-00041'] };
  const items = prepareWarehouseItems([tv, office, outsideStock, tv], data.assets, data.deviceCategories);
  assert.equal(items.length, 3);
  assert.deepEqual(getTicketGroups({ details: { lineItems: items } }).map((group) => [group.categoryName, group.quantity]), [['TV', 2], ['Văn phòng', 1]]);
  tv.assetIds.pop();
  assert.equal(prepareWarehouseItems([tv, office], data.assets, data.deviceCategories).length, 2);
});

test('cấp phát, thu hồi và thanh lý lưu danh sách thiết bị đã chọn cùng tên, mã vạch', async () => {
  const data = await api.getDashboard();
  const lineItems = prepareWarehouseItems([{ ...createUsageGroup(), categoryId: 'DM-TB-05', assetIds: ['TV-001', 'TV-002'] }], data.assets, data.deviceCategories);
  const asset = getTicketGroups({ details: { lineItems } }).map((group) => `${group.categoryName} - ${group.quantity}`).join(', ');
  for (const [type, prefix] of [['Cấp phát', 'CP'], ['Thu hồi', 'TH'], ['Thanh lý', 'TL']]) {
    const ticket = await api.createTicket({ type, asset, lineItems, totalQuantity: lineItems.length, requester: 'Phòng Đào tạo', department: 'Kho tổng', reason: 'Nội dung thử', note: 'Chọn thiết bị có sẵn' });
    assert.ok(ticket.id.startsWith(`${prefix}-`));
    assert.equal(ticket.status, 'Chờ duyệt');
    assert.equal(ticket.details.totalQuantity, 2);
    assert.deepEqual(ticket.details.lineItems.map((item) => [item.assetId, item.name, item.barcode]), [['TV-001', 'TV Samsung A1', 'BC-TV001'], ['TV-002', 'TV Samsung A2', 'BC-TV002']]);
    assert.equal(getTicketGroups(ticket)[0].quantity, 2);
    assert.equal(ticket.details.reason, 'Nội dung thử');
  }
  const after = await api.getDashboard();
  assert.deepEqual(after.assets, data.assets);
  assert.deepEqual(after.stockQuantities, data.stockQuantities);
});
