import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api } from '../src/mockApi.js';
import { filterWarehouseTickets, getTicketGroups } from '../src/warehouseTickets.js';
import { createUsageGroup, prepareUsageItems } from '../src/usageTickets.js';

test('mỗi nghiệp vụ sử dụng có phiếu mẫu, thiết bị nhóm theo loại và mã vạch', async () => {
  const data = await api.getDashboard();
  for (const type of ['Mượn / Trả', 'Điều chuyển', 'Báo hỏng / Sửa chữa']) {
    const tickets = filterWarehouseTickets(data.tickets, type);
    assert.equal(tickets.length, 2);
    assert.ok(tickets.every((ticket) => ticket.createdBy && ticket.history.length));
    assert.ok(tickets.every((ticket) => getTicketGroups(ticket, data.assets, data.deviceCategories).every((group) => group.items.every((item) => item.barcode))));
  }
  const borrow = data.tickets.find((ticket) => ticket.id === 'PM-2045');
  assert.equal(getTicketGroups(borrow, data.assets, data.deviceCategories)[0].quantity, 4);
  assert.ok(borrow.details.lineItems.every((item) => item.loanStatus === 'Đã trả'));
});

test('chọn nhiều thiết bị có sẵn tự đếm và không lặp giữa các nhóm', async () => {
  const data = await api.getDashboard();
  const group = { ...createUsageGroup(), categoryId: 'DM-TB-05', assetIds: ['TV-001', 'TV-002'] };
  const computer = { ...createUsageGroup(), categoryId: 'DM-TB-02', assetIds: ['TB-00057'] };
  const items = prepareUsageItems([group, computer, group], data.assets, data.deviceCategories);
  assert.equal(items.length, 3);
  assert.deepEqual(getTicketGroups({ details: { lineItems: items } }).map((item) => [item.categoryName, item.quantity]), [['TV', 2], ['Máy tính', 1]]);
  assert.equal(items[0].barcode, 'BC-TV001');
  group.assetIds.pop();
  assert.equal(prepareUsageItems([group, computer], data.assets, data.deviceCategories).length, 2);
  assert.deepEqual(prepareUsageItems([{ ...group, categoryId: 'không tồn tại' }], data.assets, data.deviceCategories), []);
});

test('phiếu mới lưu nhóm thiết bị cùng thông tin riêng, chưa thay đổi thiết bị hay tồn kho', async () => {
  const data = await api.getDashboard();
  const items = prepareUsageItems([{ ...createUsageGroup(), categoryId: 'DM-TB-05', assetIds: ['TV-001', 'TV-002'] }], data.assets, data.deviceCategories);
  for (const [type, prefix] of [['Mượn / Trả', 'PM'], ['Điều chuyển', 'PDC'], ['Báo hỏng / Sửa chữa', 'PSC']]) {
    const ticket = await api.createTicket({ type, asset: 'TV - 2', lineItems: items, totalQuantity: 2, requester: 'Người thử', department: 'Khoa CNTT', borrowAt: '2026-10-15T09:00:00+07:00', reason: 'Bổ sung thiết bị', damageDescription: 'Không lên hình' });
    assert.ok(ticket.id.startsWith(`${prefix}-`));
    assert.equal(ticket.details.totalQuantity, 2);
    assert.equal(ticket.details.damageDescription, 'Không lên hình');
    assert.equal(getTicketGroups(ticket)[0].quantity, 2);
    assert.equal(ticket.status, type === 'Báo hỏng / Sửa chữa' ? 'Cần xử lý' : 'Chờ duyệt');
    assert.ok(ticket.details.lineItems.every((item) => item.approvalStatus === 'Chờ duyệt' && !item.loanStatus));
    assert.equal(filterWarehouseTickets((await api.getDashboard()).tickets, type, ticket.id).length, 1);
  }
  const after = await api.getDashboard();
  assert.deepEqual(after.assets, data.assets);
  assert.deepEqual(after.stockQuantities, data.stockQuantities);
});
