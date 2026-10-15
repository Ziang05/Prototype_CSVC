import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { api, roles } from '../src/mockApi.js';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => server.close());
const { WarehouseTicketDetail } = await server.ssrLoadModule('/src/WarehouseTickets.jsx');

test('chi tiết hiện đủ thông tin và chỉ hiện nút duyệt cho trưởng phòng với phiếu chờ duyệt', async () => {
  const data = await api.getDashboard();
  for (const ticket of data.tickets) {
    const props = {
      ticket, action: { requesterLabel: 'Người yêu cầu', departmentLabel: 'Đơn vị xử lý' },
      departments: data.departments, assets: data.assets, categories: data.deviceCategories, onBack() {},
    };
    const manager = renderToString(createElement(WarehouseTicketDetail, { ...props, onApprove: async () => {} }));
    assert.match(manager, new RegExp(`Chi tiết phiếu ${ticket.id}`));
    assert.match(manager, /Danh sách loại thiết bị/);
    assert.match(manager, /Mã vạch/);
    assert.match(manager, /Lịch sử xử lý/);
    assert.equal(manager.includes('>Duyệt phiếu</button>'), ticket.status === 'Chờ duyệt', ticket.id);
    const staff = renderToString(createElement(WarehouseTicketDetail, props));
    assert.ok(!staff.includes('>Duyệt phiếu</button>'), ticket.id);
  }
});

test('duyệt phiếu mọi nghiệp vụ cập nhật từng thiết bị, giữ thông tin và ghi lịch sử đúng một lần', async () => {
  const before = await api.getDashboard();
  for (const type of ['Nhập kho', 'Cấp phát', 'Thu hồi', 'Thanh lý', 'Mượn / Trả', 'Điều chuyển', 'Bảo trì', 'Sửa chữa', 'Bảo hành']) {
    const draft = await api.createTicket({ type, asset: 'TV - 1', requester: 'Khoa CNTT', department: 'Kho tổng', note: 'Giữ ghi chú', lineItems: [{ assetId: 'TV-001', quantity: 1, approvalStatus: 'Chờ duyệt', repairRequest: 'Kiểm tra màn hình' }] });
    const approved = await api.approveTicket(draft.id, roles[0]);
    assert.equal(approved.status, 'Đã duyệt');
    assert.equal(approved.details.note, draft.details.note);
    assert.equal(approved.details.lineItems[0].barcode, 'BC-TV001');
    assert.equal(approved.details.lineItems[0].repairRequest, 'Kiểm tra màn hình');
    assert.equal(approved.details.lineItems[0].approvalStatus, 'Cho phép');
    assert.equal(approved.details.lineItems[0].approvedBy, roles[0]);
    assert.ok(approved.details.lineItems[0].approvedAt);
    if (type === 'Mượn / Trả') assert.equal(approved.details.lineItems[0].loanStatus, 'Đang mượn');
    if (type === 'Sửa chữa') assert.equal(approved.details.lineItems[0].repairStatus, 'Đang sửa');
    assert.equal(approved.history.length, draft.history.length + 1);
    assert.equal(approved.history.at(-1).actor, roles[0]);
    await assert.rejects(api.approveTicket(draft.id, roles[0]), /đang chờ duyệt/);
    approved.details.lineItems[0].name = 'Thay đổi bản trả về';
    const saved = (await api.getDashboard()).tickets.find((item) => item.id === draft.id);
    assert.equal(saved.history.length, approved.history.length);
    assert.equal(saved.details.lineItems[0].name, draft.details.lineItems[0].name);
  }
  const after = await api.getDashboard();
  assert.deepEqual(after.assets, before.assets);
  assert.deepEqual(after.stockQuantities, before.stockQuantities);
});

test('không duyệt phiếu đã hủy, đang xử lý, không tồn tại hoặc bằng vai trò nhân viên', async () => {
  const before = await api.getDashboard();
  for (const role of [roles[1], roles[2], undefined]) {
    await assert.rejects(api.approveTicket('PN-1027', role), /Chỉ Trưởng phòng/);
  }
  for (const id of ['TL-3002', 'PSC-4482', 'PSC-4483']) {
    await assert.rejects(api.approveTicket(id, roles[0]), /đang chờ duyệt/);
  }
  await assert.rejects(api.approveTicket('KHONG-TON-TAI', roles[0]), /Không tìm thấy/);
  assert.deepEqual((await api.getDashboard()).tickets, before.tickets);
});

test('duyệt phiếu không ghi đè quyết định hoặc kết quả đã lưu của từng thiết bị', async () => {
  const draft = await api.createTicket({ type: 'Mượn / Trả', asset: 'TV - 3', lineItems: [
    { assetId: 'TV-001', quantity: 1, approvalStatus: 'Từ chối', approvedBy: 'Người duyệt trước' },
    { assetId: 'TV-002', quantity: 1, approvalStatus: 'Cho phép', loanStatus: 'Đã trả', returnedAt: '2026-10-14', receiver: 'Người nhận' },
    { assetId: 'TV-003', quantity: 1, approvalStatus: 'Chờ duyệt' },
  ] });
  const approved = await api.approveTicket(draft.id, roles[0]);
  assert.deepEqual(approved.details.lineItems.slice(0, 2), draft.details.lineItems.slice(0, 2));
  assert.equal(approved.details.lineItems[2].approvalStatus, 'Cho phép');
});
