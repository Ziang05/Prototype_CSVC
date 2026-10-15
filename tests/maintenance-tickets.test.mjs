import assert from 'node:assert/strict';
import { test } from 'node:test';
import { api } from '../src/mockApi.js';
import { filterWarehouseTickets, getTicketGroups } from '../src/warehouseTickets.js';
import { createUsageGroup, toVietnamTimestamp } from '../src/usageTickets.js';
import { prepareMaintenanceItems } from '../src/maintenanceTickets.js';

test('ngày giờ dự kiến giữ giờ Việt Nam, không lặp phần giây hoặc múi giờ', () => {
  assert.equal(toVietnamTimestamp('2026-10-20T09:30'), '2026-10-20T09:30:00+07:00');
  assert.equal(toVietnamTimestamp('2026-10-20T09:30:00'), '2026-10-20T09:30:00+07:00');
  assert.equal(toVietnamTimestamp('2026-10-20T09:30:00+07:00'), '2026-10-20T09:30:00+07:00');
  assert.equal(toVietnamTimestamp(''), '');
});

test('bảo trì, sửa chữa và bảo hành đều có phiếu mẫu theo nhóm loại và lịch sử', async () => {
  const data = await api.getDashboard();
  for (const type of ['Bảo trì', 'Sửa chữa', 'Bảo hành']) {
    const tickets = filterWarehouseTickets(data.tickets, type);
    assert.equal(tickets.length, 2);
    assert.ok(tickets.every((ticket) => ticket.history.length && ['Chờ duyệt', 'Đã duyệt', 'Đã hủy'].includes(ticket.status)));
    assert.ok(tickets.every((ticket) => getTicketGroups(ticket, data.assets, data.deviceCategories).every((group) => group.items.every((item) => item.barcode))));
  }
  assert.equal(getTicketGroups(data.tickets.find((ticket) => ticket.id === 'BT-1001'))[0].quantity, 4);
  assert.deepEqual(data.tickets.find((ticket) => ticket.id === 'SC-2002').details.lineItems.map((item) => item.repairStatus), ['Sửa xong', 'Không thể sửa']);
});

test('yêu cầu sửa và báo hỏng được lưu theo đúng từng thiết bị đã chọn', async () => {
  const data = await api.getDashboard();
  const group = { ...createUsageGroup(), categoryId: 'DM-TB-05', assetIds: ['TV-001', 'TV-002'] };
  const items = prepareMaintenanceItems([group], data.assets, data.deviceCategories, {
    'TV-001': { repairRequest: 'Kiểm tra nguồn' },
    'TV-002': { repairRequest: 'Sửa cổng HDMI', relatedDamageTicketId: 'PSC-4483' },
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].repairRequest, 'Kiểm tra nguồn');
  assert.equal(items[1].relatedDamageTicketId, 'PSC-4483');
  assert.equal(items[1].barcode, 'BC-TV002');
  group.assetIds.pop();
  assert.equal(prepareMaintenanceItems([group], data.assets, data.deviceCategories).length, 1);
});

test('phiếu mới giữ nội dung riêng, chưa khởi tạo kết quả trước duyệt hoặc đổi tồn kho', async () => {
  const data = await api.getDashboard();
  const items = prepareMaintenanceItems([{ ...createUsageGroup(), categoryId: 'DM-TB-04', assetIds: ['TB-00078'] }], data.assets, data.deviceCategories, { 'TB-00078': { repairRequest: 'Thay nguồn', relatedDamageTicketId: 'PSC-4482' } });
  for (const [type, prefix] of [['Bảo trì', 'BT'], ['Sửa chữa', 'SC'], ['Bảo hành', 'BH']]) {
    const ticket = await api.createTicket({ type, asset: 'Hạ tầng mạng - 1', lineItems: items, totalQuantity: 1, maintenanceKind: 'Đột xuất', plannedAt: '2026-10-20T09:00:00+07:00', workDescription: 'Kiểm tra nguồn', warrantyReference: 'BH-THU', department: 'Đơn vị bên ngoài' });
    assert.ok(ticket.id.startsWith(`${prefix}-`));
    assert.equal(ticket.status, 'Chờ duyệt');
    assert.equal(ticket.details.workDescription, 'Kiểm tra nguồn');
    assert.equal(ticket.details.lineItems[0].relatedDamageTicketId, 'PSC-4482');
    assert.equal(ticket.details.lineItems[0].approvalStatus, 'Chờ duyệt');
    assert.equal(ticket.details.lineItems[0].repairStatus, undefined);
    assert.equal(ticket.details.lineItems[0].result, undefined);
    assert.equal(filterWarehouseTickets((await api.getDashboard()).tickets, type, ticket.id).length, 1);
  }
  const after = await api.getDashboard();
  assert.deepEqual(after.assets, data.assets);
  assert.deepEqual(after.stockQuantities, data.stockQuantities);
});
