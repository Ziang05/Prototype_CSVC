import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api } from '../src/mockApi.js';
import { createImportGroup, createImportItem, filterWarehouseTickets, getTicketGroups, getTicketLineItems, prepareImportGroups } from '../src/warehouseTickets.js';

test('mỗi nghiệp vụ chỉ hiện phiếu đúng loại, có mẫu và chi tiết thiết bị', async () => {
  const { tickets } = await api.getDashboard();
  for (const type of ['Nhập kho', 'Cấp phát', 'Thu hồi', 'Thanh lý']) {
    const result = filterWarehouseTickets(tickets, type);
    assert.ok(result.length >= 2);
    assert.ok(result.every((ticket) => ticket.type === type));
    assert.ok(result.every((ticket) => ticket.createdBy && ticket.history.length && getTicketLineItems(ticket).length));
  }
  const cancelled = filterWarehouseTickets(tickets, 'Thanh lý', 'TL-3002', 'Đã hủy');
  assert.equal(cancelled.length, 1);
  assert.equal(filterWarehouseTickets(tickets, 'Thu hồi', 'TL-3002').length, 0);
  assert.equal(getTicketLineItems(tickets.find((ticket) => ticket.id === 'PN-1027')).length, 10);
});

test('tạo phiếu lưu đầy đủ thông tin và lịch sử, sinh mã riêng không trùng', async () => {
  const ids = new Set();
  for (const [type, prefix] of [['Nhập kho', 'PN'], ['Cấp phát', 'CP'], ['Thu hồi', 'TH'], ['Thanh lý', 'TL']]) {
    const payload = { type, asset: 'Thiết bị thử', createdBy: 'Người tạo thử', requester: 'Khoa CNTT', department: 'Kho tổng', reason: 'Kiểm tra mẫu', note: 'Ghi chú thử', lineItems: [{ assetId: 'TB-00057', name: 'Laptop Dell', quantity: 1, approvalStatus: 'Chờ duyệt' }] };
    const ticket = await api.createTicket(payload);
    assert.ok(ticket.id.startsWith(`${prefix}-`));
    assert.ok(!ids.has(ticket.id));
    ids.add(ticket.id);
    payload.lineItems[0].name = 'Thay đổi ngoài phiếu';
    const { tickets } = await api.getDashboard();
    const saved = filterWarehouseTickets(tickets, type).find((item) => item.id === ticket.id);
    assert.equal(getTicketLineItems(saved)[0].name, 'Laptop Dell');
    assert.equal(saved.details.reason, 'Kiểm tra mẫu');
    assert.equal(saved.createdBy, 'Người tạo thử');
    assert.match(saved.createdAt, /T/);
    assert.equal(saved.history.length, 1);
    const second = await api.createTicket({ ...payload, asset: 'Thiết bị thứ hai' });
    assert.notEqual(second.id, ticket.id);
  }
});

test('phiếu cũ không có chi tiết vẫn xem được nội dung đã lưu', () => {
  assert.deepEqual(getTicketLineItems({ asset: 'Thiết bị cũ' }), [{ name: 'Thiết bị cũ' }]);
  assert.deepEqual(getTicketLineItems({ details: { importItems: [] } }), []);
  assert.deepEqual(filterWarehouseTickets(undefined, 'Cấp phát'), []);
});

test('phiếu nhóm đúng loại và giữ tên, mã vạch của từng thiết bị', async () => {
  const data = await api.getDashboard();
  const ticket = data.tickets.find((ticket) => ticket.id === 'PN-1026');
  const groups = getTicketGroups(ticket, data.assets, data.deviceCategories);
  assert.deepEqual(groups.map((group) => [group.categoryName, group.quantity]), [['Thiết bị trình chiếu', 2], ['TV', 4]]);
  assert.equal(groups[1].items[0].name, 'TV Samsung A1');
  assert.equal(groups[1].items[0].barcode, 'BC-TV001');
  assert.equal(filterWarehouseTickets(data.tickets, 'Nhập kho', 'TV Samsung A1')[0].id, 'PN-1026');
  assert.equal(filterWarehouseTickets(data.tickets, 'Nhập kho', 'BC-TV001')[0].id, 'PN-1026');
  const allocation = data.tickets.find((ticket) => ticket.id === 'CP-2011');
  const allocationGroup = getTicketGroups(allocation, data.assets, data.deviceCategories)[0];
  assert.equal(allocationGroup.categoryName, 'Thiết bị trình chiếu');
  assert.equal(allocationGroup.items[0].barcode, 'BC-TB00041');
});

test('số lượng nhập tính theo thiết bị còn lại, không theo số lượng nhập tay', async () => {
  const data = await api.getDashboard();
  const draft = { ...createImportGroup(), categoryId: 'DM-TB-05', quantity: 999, items: [
    { ...createImportItem(), name: 'TV Samsung thử', assetId: 'TV-TEST-1', barcode: 'BARCODE-TU-NHAP' },
    { ...createImportItem(), name: 'TV LG thử' },
    { ...createImportItem(), name: 'Thiết bị sẽ xóa' },
  ] };
  draft.items.pop();
  const prepared = prepareImportGroups([draft], data.deviceCategories);
  assert.equal(prepared[0].quantity, 2);
  assert.equal(prepared[0].items[0].barcode, 'BARCODE-TU-NHAP');
  assert.ok(prepared[0].items[1].assetId && prepared[0].items[1].barcode);
  assert.deepEqual(prepareImportGroups(prepared, data.deviceCategories), prepared);
  const beforeStock = data.stockQuantities.find((stock) => stock.categoryId === 'DM-TB-05').quantity;
  const ticket = await api.createTicket({ type: 'Nhập kho', asset: 'TV', importItems: prepared, totalQuantity: 999 });
  assert.equal(ticket.details.totalQuantity, 2);
  const after = await api.getDashboard();
  assert.equal(after.stockQuantities.find((stock) => stock.categoryId === 'DM-TB-05').quantity, beforeStock + 2);
  const importedAsset = after.assets.find((asset) => asset.id === 'TV-TEST-1');
  assert.equal(importedAsset.name, 'TV Samsung thử');
  assert.equal(importedAsset.barcode, 'BARCODE-TU-NHAP');
  assert.equal(importedAsset.status, 'Trong kho');
  assert.equal(getTicketGroups(ticket)[0].quantity, 2);
  const beforeRetry = after.tickets.length;
  await assert.rejects(api.createTicket({ type: 'Nhập kho', asset: 'TV', importItems: prepared }), /đã tồn tại/);
  assert.equal((await api.getDashboard()).tickets.length, beforeRetry);
});
