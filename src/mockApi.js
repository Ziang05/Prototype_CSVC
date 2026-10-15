import { prepareImportGroups } from './warehouseTickets.js';

const wait = (value, ms = 280) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const roles = [
  'Trưởng phòng CSVC',
  'Nhân viên CSVC',
  'Nhân viên phòng ban',
];

export const lifecycleSteps = [
  { key: 'nhap-kho', title: 'Nhập kho', desc: 'Nhận hàng, sinh barcode, gán mã tài sản, cập nhật thông tin.' },
  { key: 'kho-tong', title: 'Kho tổng', desc: 'Quản lý tồn kho, điều phối cấp phát, thu hồi, thanh lý.' },
  { key: 'cap-phat', title: 'Cấp phát', desc: 'Xuất kho cho phòng ban hoặc đơn vị sử dụng.' },
  { key: 'su-dung', title: 'Sử dụng', desc: 'Mượn/trả, điều chuyển, báo hỏng và theo dõi tình trạng.' },
  { key: 'bao-tri', title: 'Bảo trì / Sửa chữa', desc: 'Xử lý theo lịch, đột xuất, bảo hành hoặc sửa chữa.' },
  { key: 'cuoi-vong-doi', title: 'Thu hồi / Thanh lý', desc: 'Thu hồi về kho tổng, xuất thanh lý hoặc ve chai.' },
];

let deviceCategories = [
  { id: 'DM-TB-01', name: 'Thiết bị trình chiếu', warrantyMonths: 24, note: 'Máy chiếu, màn chiếu, thiết bị trình bày.' },
  { id: 'DM-TB-02', name: 'Máy tính', warrantyMonths: 36, note: 'Laptop, máy tính để bàn, máy trạm.' },
  { id: 'DM-TB-03', name: 'Văn phòng', warrantyMonths: 12, note: 'Máy in, máy scan, thiết bị văn phòng.' },
  { id: 'DM-TB-04', name: 'Hạ tầng mạng', warrantyMonths: 24, note: 'Access point, switch, router.' },
  { id: 'DM-TB-05', name: 'TV', warrantyMonths: 24, note: 'TV phòng học và phòng họp.' },
];

let departments = [
  { id: 'PB-001', name: 'Phòng QLCSVC', managerIds: ['ND-001', 'ND-002'], phone: '0901 111 222', note: 'Quản lý kho, tài sản và điều phối thiết bị.' },
  { id: 'PB-002', name: 'Phòng Đào tạo', managerIds: ['ND-005'], phone: '0902 222 333', note: 'Quản lý khu giảng đường và lịch sử dụng phòng.' },
  { id: 'PB-003', name: 'Khoa CNTT', managerIds: ['ND-003', 'ND-008'], phone: '0903 333 444', note: 'Quản lý phòng máy, lab và thiết bị CNTT.' },
  { id: 'PB-004', name: 'Phòng Hành chính', managerIds: ['ND-006'], phone: '0904 444 555', note: 'Quản lý khu văn phòng hành chính.' },
];

let users = [
  { id: 'ND-001', name: 'Nguyễn Văn Hòa', username: 'hoa.csvc', email: 'hoa@example.com', departmentId: 'PB-001', role: roles[0], locked: false },
  { id: 'ND-002', name: 'Lê Minh An', username: 'an.csvc', email: 'an@example.com', departmentId: 'PB-001', role: roles[1], locked: false },
  { id: 'ND-003', name: 'Trần Bảo Long', username: 'long.cntt', email: 'long@example.com', departmentId: 'PB-003', role: roles[2], locked: false },
  { id: 'ND-004', name: 'Phạm Thu Hà', username: 'ha.csvc', email: 'ha@example.com', departmentId: 'PB-001', role: roles[1], locked: false },
  { id: 'ND-005', name: 'Nguyễn Minh Anh', username: 'anh.daotao', email: 'anh@example.com', departmentId: 'PB-002', role: roles[2], locked: false },
  { id: 'ND-006', name: 'Lê Thu Hà', username: 'ha.hanhchinh', email: 'thuha@example.com', departmentId: 'PB-004', role: roles[2], locked: true },
  { id: 'ND-007', name: 'Đỗ Quốc Huy', username: 'huy.csvc', email: 'huy@example.com', departmentId: 'PB-001', role: roles[1], locked: true },
  { id: 'ND-008', name: 'Võ Ngọc Mai', username: 'mai.cntt', email: 'mai@example.com', departmentId: 'PB-003', role: roles[2], locked: false },
];

export function getDepartmentManagerIds(department, userList = []) {
  if (Array.isArray(department.managerIds)) return [...new Set(department.managerIds)];
  return userList.filter((user) => user.name === department.manager).map((user) => user.id);
}

let stockQuantities = [
  { categoryId: 'DM-TB-01', quantity: 8, updatedAt: '2026-10-12' },
  { categoryId: 'DM-TB-02', quantity: 14, updatedAt: '2026-10-13' },
  { categoryId: 'DM-TB-03', quantity: 5, updatedAt: '2026-10-10' },
  { categoryId: 'DM-TB-04', quantity: 9, updatedAt: '2026-10-14' },
  { categoryId: 'DM-TB-05', quantity: 4, updatedAt: '2026-10-10' },
];

let stockTransactions = [
  { id: 'ST-001', categoryId: 'DM-TB-01', change: 4, source: 'Phiếu nhập kho #PN-1001', date: '2026-10-01' },
  { id: 'ST-002', categoryId: 'DM-TB-01', change: -1, source: 'Phiếu xuất kho #PX-1003', date: '2026-10-03' },
  { id: 'ST-003', categoryId: 'DM-TB-01', change: 1, source: 'Phiếu thu hồi #TH-1002', date: '2026-10-12' },
  { id: 'ST-004', categoryId: 'DM-TB-02', change: 10, source: 'Phiếu nhập kho #PN-1027', date: '2026-10-13' },
  { id: 'ST-005', categoryId: 'DM-TB-02', change: -2, source: 'Phiếu cấp phát #CP-2011', date: '2026-10-13' },
  { id: 'ST-006', categoryId: 'DM-TB-03', change: 5, source: 'Phiếu nhập kho #PN-1005', date: '2026-10-10' },
  { id: 'ST-007', categoryId: 'DM-TB-04', change: 12, source: 'Phiếu nhập kho #PN-1008', date: '2026-10-08' },
  { id: 'ST-008', categoryId: 'DM-TB-04', change: -3, source: 'Phiếu sửa chữa #SC-4482', date: '2026-10-14' },
];

let locations = [
  {
    id: 'TOA-A',
    name: 'Tòa A',
    note: 'Khu giảng đường chính',
    locked: false,
    floors: [
      {
        id: 'A-1',
        name: 'Tầng 1',
        rooms: [
          { id: 'A1.101', name: 'A1.101', function: 'Phòng học', department: 'Phòng Đào tạo', locked: false },
          { id: 'A1.102', name: 'A1.102', function: 'Phòng máy', department: 'Khoa CNTT', locked: false },
        ],
      },
      {
        id: 'A-2',
        name: 'Tầng 2',
        rooms: [
          { id: 'A2.305', name: 'A2.305', function: 'Phòng học lý thuyết', department: 'Phòng Đào tạo', locked: false },
        ],
      },
    ],
  },
  {
    id: 'TOA-B',
    name: 'Tòa B',
    note: 'Khu văn phòng và phòng lab',
    locked: false,
    floors: [
      {
        id: 'B-1',
        name: 'Tầng 1',
        rooms: [
          { id: 'B1.204', name: 'B1.204', function: 'Phòng lab', department: 'Khoa CNTT', locked: false },
        ],
      },
    ],
  },
  {
    id: 'TOA-C',
    name: 'Tòa C',
    note: 'Khu hành chính',
    locked: false,
    floors: [
      {
        id: 'C-1',
        name: 'Tầng 1',
        rooms: [
          { id: 'C1.101', name: 'C1.101', function: 'Văn phòng', department: 'Phòng Hành chính', locked: false },
          { id: 'KHO-CSVC', name: 'Kho CSVC', function: 'Kho tổng', department: 'Phòng QLCSVC', locked: false },
        ],
      },
    ],
  },
];

let assets = [
  {
    id: 'TB-00041',
    barcode: 'BC-TB00041',
    name: 'Máy chiếu Epson EB-X51',
    category: 'Thiết bị trình chiếu',
    categoryId: 'DM-TB-01',
    departmentId: 'PB-002',
    buildingId: 'TOA-A',
    floorId: 'A-2',
    roomId: 'A2.305',
    department: 'Phòng Đào tạo',
    room: 'A2.305',
    status: 'Đang sử dụng',
    condition: 'Tốt',
    owner: 'Nguyễn Minh Anh',
    nextMaintenance: '2026-11-12',
  },
  {
    id: 'TB-00057',
    barcode: 'BC-TB00057',
    name: 'Laptop Dell Latitude 5440',
    category: 'Máy tính',
    categoryId: 'DM-TB-02',
    departmentId: 'PB-003',
    buildingId: 'TOA-B',
    floorId: 'B-1',
    roomId: 'B1.204',
    department: 'Khoa CNTT',
    room: 'B1.204',
    status: 'Cho mượn',
    condition: 'Cần kiểm tra',
    owner: 'Trần Bảo Long',
    nextMaintenance: '2026-10-28',
  },
  {
    id: 'TB-00063',
    barcode: 'BC-TB00063',
    name: 'Máy in Canon LBP 2900',
    category: 'Văn phòng',
    categoryId: 'DM-TB-03',
    departmentId: 'PB-001',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Tốt',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2026-12-05',
  },
  {
    id: 'TB-00078',
    barcode: 'BC-TB00078',
    name: 'Bộ phát Wi-Fi Aruba AP-515',
    category: 'Hạ tầng mạng',
    categoryId: 'DM-TB-04',
    departmentId: 'PB-004',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'C1.101',
    department: 'Phòng Hành chính',
    room: 'C1.101',
    status: 'Báo hỏng',
    condition: 'Hỏng',
    owner: 'Lê Thu Hà',
    nextMaintenance: '2026-10-16',
  },
  ...['TV Samsung A1', 'TV Samsung A2', 'TV LG A1', 'TV Sony A1'].map((name, index) => ({
    id: `TV-${String(index + 1).padStart(3, '0')}`, name, barcode: `BC-TV${String(index + 1).padStart(3, '0')}`,
    categoryId: 'DM-TB-05', category: 'TV', departmentId: 'PB-001', department: 'Phòng QLCSVC',
    buildingId: 'TOA-C', floorId: 'C-1', roomId: 'KHO-CSVC', room: 'Kho CSVC',
    status: 'Trong kho', condition: 'Tốt', owner: '', nextMaintenance: '',
  })),
];

let tickets = [
  {
    id: 'PN-1027',
    type: 'Nhập kho',
    asset: '10 máy tính để bàn HP ProDesk',
    requester: 'Khoa CNTT',
    department: 'Kho tổng',
    status: 'Chờ duyệt',
    priority: 'Cao',
    createdAt: '2026-10-13',
    createdBy: 'Lê Minh An',
    details: {
      supplier: 'Công ty Thiết bị Minh Phát', carrier: 'Vận chuyển An Phát', requestCode: 'YC-2026-014', deliveryDate: '2026-10-13', deliveryBatch: 'Đợt 1',
      requestDepartmentId: 'PB-003', totalQuantity: 10, note: 'Nhập máy tính phục vụ phòng thực hành.',
      importItems: [{ categoryId: 'DM-TB-02', categoryName: 'Máy tính', items: Array.from({ length: 10 }, (_, index) => ({ name: `Máy tính HP ProDesk ${index + 1}`, assetId: `HP-${String(index + 1).padStart(3, '0')}`, barcode: `BC-HP${String(index + 1).padStart(3, '0')}` })) }],
    },
    history: [{ time: '2026-10-13T08:30:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu nhập kho' }],
  },
  {
    id: 'PN-1026', type: 'Nhập kho', asset: 'Thiết bị trình chiếu - 2, TV - 4', requester: 'Phòng Đào tạo', department: 'Kho tổng', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-10', createdBy: 'Phạm Thu Hà',
    details: { supplier: 'Công ty Thiết bị ABC', carrier: 'Giao hàng nội bộ', requestCode: 'YC-2026-012', deliveryDate: '2026-10-10', deliveryBatch: 'Đợt 2', totalQuantity: 6, note: 'Đã kiểm tra phụ kiện kèm theo.', importItems: [{ categoryId: 'DM-TB-01', categoryName: 'Thiết bị trình chiếu', items: [{ name: 'Máy chiếu Epson X1', assetId: 'MC-001', barcode: 'BC-MC001' }, { name: 'Máy chiếu Epson X2', assetId: 'MC-002', barcode: 'BC-MC002' }] }, { categoryId: 'DM-TB-05', categoryName: 'TV', items: [{ name: 'TV Samsung A1', assetId: 'TV-001', barcode: 'BC-TV001' }, { name: 'TV Samsung A2', assetId: 'TV-002', barcode: 'BC-TV002' }, { name: 'TV LG A1', assetId: 'TV-003', barcode: 'BC-TV003' }, { name: 'TV Sony A1', assetId: 'TV-004', barcode: 'BC-TV004' }] }] },
    history: [{ time: '2026-10-10T09:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu nhập kho' }, { time: '2026-10-10T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Duyệt phiếu' }],
  },
  {
    id: 'CP-2011', type: 'Cấp phát', asset: 'Máy chiếu Epson EB-X51', requester: 'Phòng Đào tạo', department: 'Kho tổng', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-03', createdBy: 'Lê Minh An',
    details: { note: 'Cấp phát phục vụ giảng dạy tại A2.305.', lineItems: [{ assetId: 'TB-00041', name: 'Máy chiếu Epson EB-X51', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-03T10:00:00+07:00', result: 'Đã cấp phát', receiver: 'Nguyễn Minh Anh', completedAt: '2026-10-03T14:00:00+07:00', recordedBy: 'Lê Minh An' }] },
    history: [{ time: '2026-10-03T09:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu cấp phát' }, { time: '2026-10-03T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép cấp phát TB-00041' }, { time: '2026-10-03T14:00:00+07:00', actor: 'Lê Minh An', action: 'Ghi nhận bàn giao TB-00041 cho Nguyễn Minh Anh' }],
  },
  {
    id: 'CP-2012', type: 'Cấp phát', asset: 'Laptop Dell Latitude 5440', requester: 'Khoa CNTT', department: 'Kho tổng', status: 'Chờ duyệt', priority: 'Cao', createdAt: '2026-10-14', createdBy: 'Phạm Thu Hà',
    details: { note: 'Bổ sung máy phục vụ thực hành.', lineItems: [{ assetId: 'TB-00057', name: 'Laptop Dell Latitude 5440', quantity: 1, approvalStatus: 'Chờ duyệt' }] },
    history: [{ time: '2026-10-14T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu cấp phát' }],
  },
  {
    id: 'TH-1002', type: 'Thu hồi', asset: 'Máy chiếu Epson EB-X51', requester: 'Phòng Đào tạo', department: 'Kho tổng', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-12', createdBy: 'Lê Minh An',
    details: { note: 'Thu hồi sau đợt sử dụng tại giảng đường.', lineItems: [{ assetId: 'TB-00041', name: 'Máy chiếu Epson EB-X51', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-12T09:00:00+07:00', result: 'Đã thu hồi về kho', receiver: 'Phạm Thu Hà', completedAt: '2026-10-12T15:00:00+07:00', recordedBy: 'Lê Minh An' }] },
    history: [{ time: '2026-10-12T08:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu thu hồi' }, { time: '2026-10-12T09:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép thu hồi TB-00041' }, { time: '2026-10-12T15:00:00+07:00', actor: 'Lê Minh An', action: 'Ghi nhận thu hồi TB-00041 về kho' }],
  },
  {
    id: 'TH-1003', type: 'Thu hồi', asset: 'Laptop Dell Latitude 5440', requester: 'Khoa CNTT', department: 'Kho tổng', status: 'Chờ duyệt', priority: 'Trung bình', createdAt: '2026-10-15', createdBy: 'Phạm Thu Hà',
    details: { note: 'Thu hồi để kiểm tra định kỳ.', lineItems: [{ assetId: 'TB-00057', name: 'Laptop Dell Latitude 5440', quantity: 1, approvalStatus: 'Chờ duyệt' }] },
    history: [{ time: '2026-10-15T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu thu hồi' }],
  },
  {
    id: 'TL-3001', type: 'Thanh lý', asset: 'Máy in Canon LBP 2900', requester: 'Phòng QLCSVC', department: 'Kho tổng', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-09', createdBy: 'Lê Minh An',
    details: { reason: 'Thiết bị đã hết thời gian sử dụng, chi phí sửa chữa cao.', note: 'Hồ sơ thanh lý mẫu.', lineItems: [{ assetId: 'TB-00063', name: 'Máy in Canon LBP 2900', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-09T10:00:00+07:00', result: 'Đã thanh lý', performer: 'Phạm Thu Hà', recordedBy: 'Lê Minh An', completedAt: '2026-10-10T15:00:00+07:00' }] },
    history: [{ time: '2026-10-09T08:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu thanh lý' }, { time: '2026-10-09T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép thanh lý TB-00063' }, { time: '2026-10-10T15:00:00+07:00', actor: 'Lê Minh An', action: 'Ghi nhận kết quả thanh lý TB-00063' }],
  },
  {
    id: 'TL-3002', type: 'Thanh lý', asset: 'Bộ phát Wi-Fi Aruba AP-515', requester: 'Phòng Hành chính', department: 'Kho tổng', status: 'Đã hủy', priority: 'Thấp', createdAt: '2026-10-11', createdBy: 'Phạm Thu Hà',
    details: { reason: 'Đề xuất thay thiết bị mạng cũ.', note: 'Hủy đề xuất để kiểm tra khả năng sửa chữa.', lineItems: [{ assetId: 'TB-00078', name: 'Bộ phát Wi-Fi Aruba AP-515', quantity: 1, approvalStatus: 'Chờ duyệt' }] },
    history: [{ time: '2026-10-11T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu thanh lý' }, { time: '2026-10-11T11:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Hủy phiếu thanh lý' }],
  },
  {
    id: 'PM-2044', type: 'Mượn / Trả', asset: 'Thiết bị trình chiếu - 1', requester: 'Khoa CNTT', department: 'Phòng Đào tạo', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-12', createdBy: 'Trần Bảo Long',
    details: { borrowAt: '2026-10-12T08:00:00+07:00', expectedReturnAt: '2026-10-16T17:00:00+07:00', note: 'Mượn phục vụ hội thảo.', lineItems: [{ assetId: 'TB-00041', name: 'Máy chiếu Epson EB-X51', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Lê Minh An', approvedAt: '2026-10-12T09:00:00+07:00', loanStatus: 'Đang mượn' }] },
    history: [{ time: '2026-10-12T08:00:00+07:00', actor: 'Trần Bảo Long', action: 'Tạo phiếu mượn' }, { time: '2026-10-12T09:00:00+07:00', actor: 'Lê Minh An', action: 'Cho phép mượn TB-00041' }],
  },
  {
    id: 'PM-2045', type: 'Mượn / Trả', asset: 'TV - 4', requester: 'Nguyễn Minh Anh', department: 'Phòng QLCSVC', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-10', createdBy: 'Nguyễn Minh Anh',
    details: { borrowAt: '2026-10-10T08:00:00+07:00', expectedReturnAt: '2026-10-11T17:00:00+07:00', note: 'Đã trả TV sau sự kiện.', lineItems: ['TV Samsung A1', 'TV Samsung A2', 'TV LG A1', 'TV Sony A1'].map((name, index) => ({ assetId: `TV-${String(index + 1).padStart(3, '0')}`, name, categoryId: 'DM-TB-05', categoryName: 'TV', barcode: `BC-TV${String(index + 1).padStart(3, '0')}`, quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Lê Minh An', approvedAt: '2026-10-10T09:00:00+07:00', loanStatus: 'Đã trả', receiver: 'Phạm Thu Hà', returnedAt: '2026-10-11T15:00:00+07:00', conditionOnReturn: 'Tốt' })) },
    history: [{ time: '2026-10-10T08:00:00+07:00', actor: 'Nguyễn Minh Anh', action: 'Tạo phiếu mượn TV' }, { time: '2026-10-10T09:00:00+07:00', actor: 'Lê Minh An', action: 'Cho phép mượn 4 TV' }, { time: '2026-10-11T15:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Ghi nhận đã trả 4 TV, tình trạng tốt' }],
  },
  {
    id: 'PDC-3318', type: 'Điều chuyển', asset: 'Máy tính - 1, TV - 1', requester: 'Phòng Đào tạo', department: 'Khoa CNTT', status: 'Chờ duyệt', priority: 'Trung bình', createdAt: '2026-10-11', createdBy: 'Lê Minh An',
    details: { reason: 'Bổ sung thiết bị cho phòng thực hành.', note: 'Chờ phê duyệt điều chuyển.', lineItems: [{ assetId: 'TB-00057', name: 'Laptop Dell Latitude 5440', quantity: 1, approvalStatus: 'Chờ duyệt' }, { assetId: 'TV-001', name: 'TV Samsung A1', quantity: 1, approvalStatus: 'Chờ duyệt' }] },
    history: [{ time: '2026-10-11T08:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu điều chuyển' }],
  },
  {
    id: 'PDC-3319', type: 'Điều chuyển', asset: 'TV - 2', requester: 'Phòng QLCSVC', department: 'Phòng Đào tạo', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-13', createdBy: 'Phạm Thu Hà',
    details: { reason: 'Bố trí thiết bị cho phòng học.', note: 'Đã bàn giao theo phiếu.', lineItems: [{ assetId: 'TV-003', name: 'TV LG A1', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-13T10:00:00+07:00', result: 'Đã điều chuyển', receiver: 'Nguyễn Minh Anh', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-13T14:00:00+07:00' }, { assetId: 'TV-004', name: 'TV Sony A1', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-13T10:00:00+07:00', result: 'Đã điều chuyển', receiver: 'Nguyễn Minh Anh', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-13T14:00:00+07:00' }] },
    history: [{ time: '2026-10-13T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu điều chuyển' }, { time: '2026-10-13T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép điều chuyển 2 TV' }, { time: '2026-10-13T14:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Ghi nhận bàn giao cho Phòng Đào tạo' }],
  },
  {
    id: 'PSC-4482', type: 'Báo hỏng / Sửa chữa', asset: 'Hạ tầng mạng - 1', requester: 'Phòng Hành chính', department: 'Phòng QLCSVC', status: 'Cần xử lý', priority: 'Cao', createdAt: '2026-10-14', createdBy: 'Lê Thu Hà',
    details: { damageDescription: 'Wi-Fi mất kết nối, đèn nguồn nhấp nháy.', note: 'Đề nghị kiểm tra tại C1.101.', lineItems: [{ assetId: 'TB-00078', name: 'Bộ phát Wi-Fi Aruba AP-515', quantity: 1, approvalStatus: 'Chờ duyệt', damageDescription: 'Mất kết nối thường xuyên' }] },
    history: [{ time: '2026-10-14T08:00:00+07:00', actor: 'Lê Thu Hà', action: 'Tạo phiếu báo hỏng' }],
  },
  {
    id: 'PSC-4483', type: 'Báo hỏng / Sửa chữa', asset: 'TV - 1', requester: 'Khoa CNTT', department: 'Phòng QLCSVC', status: 'Đang xử lý', priority: 'Trung bình', createdAt: '2026-10-15', createdBy: 'Trần Bảo Long',
    details: { damageDescription: 'TV không hiển thị hình ảnh khi cắm HDMI.', note: 'Đã tiếp nhận để kiểm tra.', lineItems: [{ assetId: 'TV-002', name: 'TV Samsung A2', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Lê Minh An', approvedAt: '2026-10-15T09:00:00+07:00', result: 'Đang kiểm tra cổng HDMI', receiver: 'Phạm Thu Hà', recordedBy: 'Lê Minh An' }] },
    history: [{ time: '2026-10-15T08:00:00+07:00', actor: 'Trần Bảo Long', action: 'Tạo phiếu báo hỏng' }, { time: '2026-10-15T09:00:00+07:00', actor: 'Lê Minh An', action: 'Tiếp nhận phiếu để kiểm tra' }],
  },
  {
    id: 'BT-1001', type: 'Bảo trì', asset: 'TV - 4', requester: 'Lê Minh An', department: 'Phòng QLCSVC', status: 'Chờ duyệt', priority: 'Trung bình', createdAt: '2026-10-14', createdBy: 'Lê Minh An',
    details: { maintenanceKind: 'Định kỳ', plannedAt: '2026-10-20T08:00:00+07:00', workDescription: 'Vệ sinh màn hình, kiểm tra nguồn và các cổng kết nối.', note: 'Bảo trì thiết bị trước đợt học mới.', lineItems: ['TV Samsung A1', 'TV Samsung A2', 'TV LG A1', 'TV Sony A1'].map((name, index) => ({ assetId: `TV-${String(index + 1).padStart(3, '0')}`, name, categoryId: 'DM-TB-05', categoryName: 'TV', barcode: `BC-TV${String(index + 1).padStart(3, '0')}`, quantity: 1, approvalStatus: 'Chờ duyệt' })) },
    history: [{ time: '2026-10-14T08:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu bảo trì định kỳ cho 4 TV' }],
  },
  {
    id: 'BT-1002', type: 'Bảo trì', asset: 'Thiết bị trình chiếu - 1, Máy tính - 1', requester: 'Phạm Thu Hà', department: 'Phòng QLCSVC', status: 'Đã duyệt', priority: 'Cao', createdAt: '2026-10-10', createdBy: 'Phạm Thu Hà',
    details: { maintenanceKind: 'Đột xuất', plannedAt: '2026-10-11T09:00:00+07:00', workDescription: 'Kiểm tra máy chiếu và vệ sinh máy tính.', note: 'Đã hoàn thành bảo trì.', lineItems: [{ assetId: 'TB-00041', name: 'Máy chiếu Epson EB-X51', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-10T10:00:00+07:00', result: 'Hoàn thành bảo trì', resultDescription: 'Đã vệ sinh bộ lọc, hình ảnh ổn định.', performer: 'Lê Minh An', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-11T15:00:00+07:00' }, { assetId: 'TB-00057', name: 'Laptop Dell Latitude 5440', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-10T10:00:00+07:00', result: 'Hoàn thành bảo trì', resultDescription: 'Đã vệ sinh và kiểm tra pin.', performer: 'Lê Minh An', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-11T15:00:00+07:00' }] },
    history: [{ time: '2026-10-10T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu bảo trì đột xuất' }, { time: '2026-10-10T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép bảo trì 2 thiết bị' }, { time: '2026-10-11T15:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Ghi nhận kết quả bảo trì 2 thiết bị' }],
  },
  {
    id: 'SC-2001', type: 'Sửa chữa', asset: 'Hạ tầng mạng - 1', requester: 'Phòng Hành chính', department: 'Phòng QLCSVC', status: 'Đã duyệt', priority: 'Cao', createdAt: '2026-10-14', createdBy: 'Lê Minh An',
    details: { plannedAt: '2026-10-16T08:00:00+07:00', workDescription: 'Kiểm tra nguồn và kết nối bộ phát Wi-Fi.', note: 'Tiếp nhận từ phiếu báo hỏng PSC-4482.', lineItems: [{ assetId: 'TB-00078', name: 'Bộ phát Wi-Fi Aruba AP-515', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-14T10:00:00+07:00', repairRequest: 'Kiểm tra bộ nguồn, thay nguồn nếu cần.', relatedDamageTicketId: 'PSC-4482', repairStatus: 'Đang sửa', resultDescription: 'Đang kiểm tra bộ cấp nguồn.', performer: 'Phạm Thu Hà' }] },
    history: [{ time: '2026-10-14T09:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu sửa chữa từ báo hỏng PSC-4482' }, { time: '2026-10-14T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép sửa chữa TB-00078' }],
  },
  {
    id: 'SC-2002', type: 'Sửa chữa', asset: 'TV - 1, Văn phòng - 1', requester: 'Khoa CNTT', department: 'Đơn vị sửa chữa Minh Phát', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-12', createdBy: 'Phạm Thu Hà',
    details: { plannedAt: '2026-10-13T08:00:00+07:00', workDescription: 'Kiểm tra cổng HDMI của TV và cơ cấu kéo giấy máy in.', note: 'Đã ghi nhận kết quả từng thiết bị.', lineItems: [{ assetId: 'TV-002', name: 'TV Samsung A2', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-12T10:00:00+07:00', repairRequest: 'Sửa cổng HDMI không nhận tín hiệu.', repairStatus: 'Sửa xong', resultDescription: 'Đã thay cổng HDMI, kiểm tra hoạt động tốt.', performer: 'Kỹ thuật viên Minh Phát', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-13T15:00:00+07:00' }, { assetId: 'TB-00063', name: 'Máy in Canon LBP 2900', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-12T10:00:00+07:00', repairRequest: 'Kiểm tra cơ cấu kéo giấy.', repairStatus: 'Không thể sửa', resultDescription: 'Không còn linh kiện thay thế phù hợp.', performer: 'Kỹ thuật viên Minh Phát', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-13T16:00:00+07:00' }] },
    history: [{ time: '2026-10-12T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu sửa chữa' }, { time: '2026-10-12T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép sửa chữa 2 thiết bị' }, { time: '2026-10-13T16:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Ghi nhận 1 thiết bị sửa xong, 1 thiết bị không thể sửa' }],
  },
  {
    id: 'BH-3001', type: 'Bảo hành', asset: 'TV - 1', requester: 'Phòng QLCSVC', department: 'Trung tâm bảo hành Sony', status: 'Chờ duyệt', priority: 'Trung bình', createdAt: '2026-10-15', createdBy: 'Lê Minh An',
    details: { plannedAt: '2026-10-17T09:00:00+07:00', workDescription: 'Kiểm tra lỗi nguồn trong thời hạn bảo hành.', warrantyReference: 'BH-SONY-2026-004', note: 'Chờ bàn giao thiết bị.', lineItems: [{ assetId: 'TV-004', name: 'TV Sony A1', quantity: 1, approvalStatus: 'Chờ duyệt' }] },
    history: [{ time: '2026-10-15T08:00:00+07:00', actor: 'Lê Minh An', action: 'Tạo phiếu đề nghị bảo hành' }],
  },
  {
    id: 'BH-3002', type: 'Bảo hành', asset: 'Máy tính - 1', requester: 'Phòng QLCSVC', department: 'Trung tâm bảo hành Dell', status: 'Đã duyệt', priority: 'Trung bình', createdAt: '2026-10-08', createdBy: 'Phạm Thu Hà',
    details: { plannedAt: '2026-10-09T09:00:00+07:00', workDescription: 'Bảo hành pin laptop.', warrantyReference: 'BH-DELL-2026-012', note: 'Đã tiếp nhận thiết bị sau bảo hành.', lineItems: [{ assetId: 'TB-00057', name: 'Laptop Dell Latitude 5440', quantity: 1, approvalStatus: 'Cho phép', approvedBy: 'Nguyễn Văn Hòa', approvedAt: '2026-10-08T10:00:00+07:00', result: 'Đã nhận lại sau bảo hành', resultDescription: 'Được thay pin mới, hoạt động ổn định.', performer: 'Trung tâm bảo hành Dell', receiver: 'Lê Minh An', recordedBy: 'Phạm Thu Hà', completedAt: '2026-10-10T16:00:00+07:00' }] },
    history: [{ time: '2026-10-08T08:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Tạo phiếu bảo hành' }, { time: '2026-10-08T10:00:00+07:00', actor: 'Nguyễn Văn Hòa', action: 'Cho phép gửi bảo hành' }, { time: '2026-10-10T16:00:00+07:00', actor: 'Phạm Thu Hà', action: 'Ghi nhận nhận lại thiết bị sau bảo hành' }],
  },
];

const history = [
  { time: '2026-08-02', title: 'Nhập kho', detail: 'Sinh barcode và gán mã tài sản TB-00041.' },
  { time: '2026-08-05', title: 'Cấp phát', detail: 'Xuất kho cho Phòng Đào tạo, phòng A2.305.' },
  { time: '2026-09-18', title: 'Mượn tạm thời', detail: 'Khoa CNTT mượn phục vụ hội thảo, không chuyển trách nhiệm quản lý.' },
  { time: '2026-10-01', title: 'Trả thiết bị', detail: 'Ghi nhận trả về đơn vị quản lý ban đầu, tình trạng tốt.' },
];

export const api = {
  async getDashboard() {
    return wait({
      assets: [...assets],
      tickets: structuredClone(tickets),
      locations: structuredClone(locations),
      deviceCategories: deviceCategories.map((category) => {
        const inStock = stockQuantities.find((stock) => stock.categoryId === category.id)?.quantity || 0;
        const outsideStock = assets.filter((asset) => asset.categoryId === category.id && asset.status !== 'Trong kho').length;
        return { ...category, totalQuantity: inStock + outsideStock, stockQuantity: inStock };
      }),
      departments: structuredClone(departments),
      users: structuredClone(users),
      stockQuantities: stockQuantities.map((stock) => ({
        ...stock,
        categoryName: deviceCategories.find((category) => category.id === stock.categoryId)?.name || stock.categoryId,
      })),
      stockTransactions: stockTransactions.map((transaction) => ({
        ...transaction,
        categoryName: deviceCategories.find((category) => category.id === transaction.categoryId)?.name || transaction.categoryId,
      })),
      history,
      stats: {
        total: assets.length,
        inStock: assets.filter((item) => item.status === 'Trong kho').length,
        inUse: assets.filter((item) => item.status === 'Đang sử dụng' || item.status === 'Cho mượn').length,
        needsAction: tickets.filter((item) => item.status !== 'Hoàn tất').length,
        rooms: locations.reduce((count, building) => count + building.floors.reduce((sum, floor) => sum + floor.rooms.length, 0), 0),
      },
    });
  },
  async createTicket(payload) {
    if (Array.isArray(payload.lineItems)) {
      payload = { ...payload, lineItems: payload.lineItems.map((item) => {
        const asset = assets.find((asset) => asset.id === item.assetId);
        return { ...item, categoryId: item.categoryId || asset?.categoryId || '', categoryName: item.categoryName || asset?.category || '', barcode: item.barcode || asset?.barcode || '', name: item.name || asset?.name || item.assetId };
      }) };
    }
    if (payload.type === 'Nhập kho' && Array.isArray(payload.importItems)) {
      const importItems = prepareImportGroups(payload.importItems, deviceCategories);
      if (!importItems.length) throw new Error('Chọn loại và thêm thiết bị trước khi tạo phiếu.');
      const ids = new Set(assets.map((asset) => asset.id));
      for (const group of importItems) {
        for (const item of group.items) {
          if (ids.has(item.assetId)) throw new Error(`Mã thiết bị ${item.assetId} đã tồn tại. Đổi mã hoặc để trống để tự sinh.`);
          ids.add(item.assetId);
        }
      }
      payload = { ...payload, importItems, totalQuantity: importItems.reduce((sum, group) => sum + group.items.length, 0), asset: importItems.map((group) => `${group.categoryName} - ${group.items.length}`).join(', ') };
    }
    const needsImmediateHandling = ['Báo hỏng / Sửa chữa'].includes(payload.type);
    const prefix = { 'Nhập kho': 'PN', 'Cấp phát': 'CP', 'Thu hồi': 'TH', 'Thanh lý': 'TL', 'Mượn / Trả': 'PM', 'Điều chuyển': 'PDC', 'Báo hỏng / Sửa chữa': 'PSC', 'Bảo trì': 'BT', 'Sửa chữa': 'SC', 'Bảo hành': 'BH' }[payload.type] || 'P';
    const nextNumber = Math.max(0, ...tickets.filter((ticket) => ticket.id.startsWith(`${prefix}-`)).map((ticket) => Number(ticket.id.slice(prefix.length + 1)) || 0)) + 1;
    const now = new Date().toISOString();
    const ticket = {
      id: `${prefix}-${String(nextNumber).padStart(4, '0')}`,
      status: needsImmediateHandling ? 'Cần xử lý' : 'Chờ duyệt',
      createdAt: now,
      priority: payload.priority,
      type: payload.type,
      asset: payload.asset,
      requester: payload.requester,
      department: payload.department,
      createdBy: payload.createdBy || 'Nhân viên CSVC',
      details: structuredClone(payload),
      history: [{ time: now, actor: payload.createdBy || 'Nhân viên CSVC', action: `Tạo phiếu ${payload.type.toLowerCase()}` }],
    };
    tickets = [ticket, ...tickets];
    if (payload.type === 'Nhập kho' && Array.isArray(payload.importItems)) {
      const today = new Date().toISOString().slice(0, 10);
      payload.importItems.forEach((group) => {
        const change = group.items?.length || 0;
        if (!change) return;
        const current = stockQuantities.find((item) => item.categoryId === group.categoryId);
        if (current) {
          current.quantity += change;
          current.updatedAt = today;
        } else {
          stockQuantities = [{ categoryId: group.categoryId, quantity: change, updatedAt: today }, ...stockQuantities];
        }
        stockTransactions = [{
          id: `ST-${ticket.id}-${stockTransactions.length + 1}`,
          categoryId: group.categoryId,
          change,
          source: `Phiếu nhập kho #${ticket.id}`,
          date: today,
        }, ...stockTransactions];
        const warehouseBuilding = locations.find((building) => building.floors.some((floor) => floor.rooms.some((room) => room.id === 'KHO-CSVC')));
        const warehouseFloor = warehouseBuilding?.floors.find((floor) => floor.rooms.some((room) => room.id === 'KHO-CSVC'));
        const warehouseRoom = warehouseFloor?.rooms.find((room) => room.id === 'KHO-CSVC');
        const managingDepartment = departments.find((department) => department.id === 'PB-001');
        assets = [...group.items.map((item) => ({
          id: item.assetId, name: item.name, barcode: item.barcode,
          categoryId: group.categoryId, category: group.categoryName,
          departmentId: managingDepartment?.id || '', department: managingDepartment?.name || '',
          buildingId: warehouseBuilding?.id || '', floorId: warehouseFloor?.id || '', roomId: warehouseRoom?.id || '', room: warehouseRoom?.name || '',
          status: 'Trong kho', condition: 'Tốt', owner: '', nextMaintenance: '',
        })), ...assets];
      });
    }
    return wait(structuredClone(ticket));
  },
  async approveTicket(id, role) {
    if (role !== roles[0]) throw new Error('Chỉ Trưởng phòng CSVC được duyệt phiếu.');
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) throw new Error('Không tìm thấy phiếu cần duyệt.');
    if (ticket.status !== 'Chờ duyệt') throw new Error('Chỉ có thể duyệt phiếu đang chờ duyệt.');
    const now = new Date().toISOString();
    const approved = {
      ...ticket,
      status: 'Đã duyệt',
      details: {
        ...ticket.details,
        ...(Array.isArray(ticket.details?.lineItems) ? {
          lineItems: ticket.details.lineItems.map((item) => {
            if (item.approvalStatus && item.approvalStatus !== 'Chờ duyệt') return item;
            return {
              ...item, approvalStatus: 'Cho phép', approvedBy: role, approvedAt: now,
              ...(ticket.type === 'Mượn / Trả' && !item.loanStatus ? { loanStatus: 'Đang mượn' } : {}),
              ...(ticket.type === 'Sửa chữa' && !item.repairStatus ? { repairStatus: 'Đang sửa' } : {}),
            };
          }),
        } : {}),
      },
      history: [...(ticket.history || []), { time: now, actor: role, action: 'Duyệt phiếu' }],
    };
    tickets = tickets.map((item) => item.id === id ? approved : item);
    return wait(structuredClone(approved));
  },
  async createBuilding(payload) {
    const id = payload.code?.trim().toUpperCase();
    const name = payload.name?.trim();
    const floorCount = Number(payload.floorCount);
    if (!id || !name) throw new Error('Vui lòng nhập mã và tên tòa.');
    if (locations.some((building) => building.id === id)) throw new Error('Mã tòa đã tồn tại.');
    if (!Number.isInteger(floorCount) || floorCount < 1 || floorCount > 100) {
      throw new Error('Số tầng phải là số nguyên từ 1 đến 100.');
    }
    const building = {
      id, name, note: payload.note?.trim() || '', locked: false,
      floors: Array.from({ length: floorCount }, (_, index) => ({
        id: `${id}-${index + 1}`, name: `Tầng ${index + 1}`, number: index + 1, rooms: [],
      })),
    };
    locations.push(building);
    return wait(structuredClone(building));
  },
  async createFloor(payload) {
    const building = locations.find((item) => item.id === payload.buildingId);
    if (!building) throw new Error('Tòa không tồn tại.');
    if (building.locked) throw new Error('Vui lòng mở khóa tòa trước khi tạo tầng.');
    const number = Number(payload.number);
    if (!Number.isInteger(number) || number < 1 || number > 100) {
      throw new Error('Số tầng phải là số nguyên từ 1 đến 100.');
    }
    if (building.floors.some((floor) => (floor.number ?? Number(floor.name.replace('Tầng ', ''))) === number)) {
      throw new Error('Tầng này đã tồn tại trong tòa.');
    }
    const floor = { id: `${building.id}-${number}`, name: `Tầng ${number}`, number, rooms: [] };
    building.floors.push(floor);
    building.floors.sort((a, b) => (a.number ?? Number(a.name.replace('Tầng ', ''))) - (b.number ?? Number(b.name.replace('Tầng ', ''))));
    return wait(structuredClone(floor));
  },
  async createRoom(payload) {
    const targetBuilding = locations.find((building) => building.id === payload.buildingId);
    if (!targetBuilding) throw new Error('Tòa không tồn tại.');
    if (targetBuilding.locked) throw new Error('Vui lòng mở khóa tòa trước khi tạo phòng.');
    const targetFloor = targetBuilding.floors.find((floor) => floor.id === payload.floorId);
    if (!targetFloor) throw new Error('Vui lòng tạo hoặc chọn tầng trước khi tạo phòng.');
    const roomCode = payload.roomCode?.trim().toUpperCase();
    if (!roomCode) throw new Error('Vui lòng nhập mã phòng.');
    if (locations.some((building) => building.floors.some((floor) => floor.rooms.some((room) => room.id.toUpperCase() === roomCode)))) {
      throw new Error('Mã phòng đã tồn tại.');
    }
    const capacity = Number(payload.capacity);
    if (!Number.isSafeInteger(capacity) || capacity < 1) throw new Error('Sức chứa phải là số nguyên dương.');
    const room = {
      id: roomCode,
      name: roomCode,
      capacity,
      function: payload.functionName,
      department: payload.department,
      locked: false,
    };
    targetFloor.rooms.push(room);
    return wait(room);
  },
  async toggleBuildingLock(buildingId) {
    locations = locations.map((building) => {
      if (building.id !== buildingId) return building;
      const locked = !building.locked;
      return {
        ...building,
        locked,
        floors: building.floors.map((floor) => ({
          ...floor,
          rooms: floor.rooms.map((room) => ({ ...room, locked: locked ? true : room.locked })),
        })),
      };
    });
    return wait(locations.find((building) => building.id === buildingId));
  },
  async toggleRoomLock(roomId) {
    locations = locations.map((building) => ({
      ...building,
      floors: building.floors.map((floor) => ({
        ...floor,
        rooms: floor.rooms.map((room) => (room.id === roomId ? { ...room, locked: !room.locked } : room)),
      })),
    }));
    return wait(roomId);
  },
  async saveDeviceCategory(payload) {
    const existingId = payload.originalId ?? (deviceCategories.some((item) => item.id === payload.id) ? payload.id : '');
    const existing = deviceCategories.find((item) => item.id === existingId);
    const id = payload.id?.trim() || `DM-TB-${String(Math.max(0, ...deviceCategories.map((item) => Number(item.id.replace('DM-TB-', '')) || 0)) + 1).padStart(2, '0')}`;
    if (!payload.name?.trim()) throw new Error('Vui lòng nhập tên loại thiết bị.');
    if (deviceCategories.some((item) => item.id === id && item.id !== existingId)) throw new Error('Mã loại thiết bị đã tồn tại.');
    const category = {
      id,
      name: payload.name.trim(),
      warrantyMonths: Number(payload.warrantyMonths ?? existing?.warrantyMonths) || 0,
      note: payload.note || '',
    };
    deviceCategories = existing ? deviceCategories.map((item) => item.id === existingId ? category : item) : [category, ...deviceCategories];
    if (existing) {
      assets = assets.map((asset) => asset.categoryId === existingId ? { ...asset, categoryId: id, category: category.name } : asset);
      stockQuantities = stockQuantities.map((stock) => stock.categoryId === existingId ? { ...stock, categoryId: id } : stock);
      stockTransactions = stockTransactions.map((transaction) => transaction.categoryId === existingId ? { ...transaction, categoryId: id } : transaction);
    }
    return wait(structuredClone(category));
  },
  async deleteDeviceCategory(id) {
    deviceCategories = deviceCategories.filter((item) => item.id !== id);
    assets = assets.map((asset) => asset.categoryId === id ? { ...asset, categoryId: '', category: 'Chưa phân loại' } : asset);
    stockQuantities = stockQuantities.filter((stock) => stock.categoryId !== id);
    return wait(id);
  },
  async saveAsset(payload) {
    const existing = payload.originalId ? assets.find((asset) => asset.id === payload.originalId) : null;
    if (payload.originalId && !existing) throw new Error('Thiết bị không tồn tại.');
    if (!payload.name?.trim()) throw new Error('Vui lòng nhập tên thiết bị.');
    const id = payload.id?.trim() || `TB-${String(Math.max(0, ...assets.map((asset) => Number(asset.id.replace('TB-', '')) || 0)) + 1).padStart(5, '0')}`;
    if (assets.some((asset) => asset.id === id && asset.id !== existing?.id)) throw new Error('Mã thiết bị đã tồn tại.');
    const category = deviceCategories.find((item) => item.id === payload.categoryId);
    const department = departments.find((item) => item.id === payload.departmentId);
    const building = locations.find((item) => item.floors.some((floor) => floor.rooms.some((room) => room.id === payload.roomId)));
    const floor = building?.floors.find((item) => item.rooms.some((room) => room.id === payload.roomId));
    const room = floor?.rooms.find((item) => item.id === payload.roomId);
    const asset = {
      ...existing, id, name: payload.name.trim(),
      categoryId: category?.id || '', category: category?.name || 'Chưa phân loại',
      departmentId: department?.id || '', department: department?.name || '',
      buildingId: building?.id || '', floorId: floor?.id || '', roomId: room?.id || '', room: room?.name || '',
      status: payload.status || 'Đang sử dụng', condition: payload.condition || '',
      owner: existing?.owner || '', nextMaintenance: existing?.nextMaintenance || '',
    };
    const updateStock = (categoryId, change) => {
      if (!categoryId) return;
      const stock = stockQuantities.find((item) => item.categoryId === categoryId);
      if (stock) stock.quantity = Math.max(0, stock.quantity + change);
      else if (change > 0) stockQuantities.push({ categoryId, quantity: change, updatedAt: new Date().toISOString().slice(0, 10) });
    };
    if (existing?.status === 'Trong kho') updateStock(existing.categoryId, -1);
    if (asset.status === 'Trong kho') updateStock(asset.categoryId, 1);
    assets = existing ? assets.map((item) => item.id === existing.id ? asset : item) : [asset, ...assets];
    return wait(structuredClone(asset));
  },
  async deleteAsset(id) {
    const asset = assets.find((item) => item.id === id);
    if (asset?.status === 'Trong kho') {
      const stock = stockQuantities.find((item) => item.categoryId === asset.categoryId);
      if (stock) stock.quantity = Math.max(0, stock.quantity - 1);
    }
    assets = assets.filter((item) => item.id !== id);
    return wait(id);
  },
  async saveUser(payload) {
    const existing = payload.id ? users.find((user) => user.id === payload.id) : null;
    if (payload.id && !existing) throw new Error('Người dùng không tồn tại.');
    const name = payload.name?.trim();
    if (!name) throw new Error('Vui lòng nhập họ tên.');
    const nextNumber = Math.max(0, ...users.map((user) => Number(user.id.replace('ND-', '')) || 0)) + 1;
    const username = payload.username?.trim() || existing?.username || `nguoidung${nextNumber}`;
    const email = payload.email?.trim() || '';
    const user = {
      id: existing?.id || `ND-${String(nextNumber).padStart(3, '0')}`,
      name, username, email,
      role: roles.includes(payload.role) ? payload.role : roles[1],
      departmentId: payload.departmentId || '',
      locked: existing?.locked ?? false,
    };
    users = existing ? users.map((item) => item.id === user.id ? user : item) : [user, ...users];
    return wait(structuredClone(user));
  },
  async toggleUserLock(id) {
    const user = users.find((item) => item.id === id);
    if (!user) throw new Error('Người dùng không tồn tại.');
    user.locked = !user.locked;
    return wait(structuredClone(user));
  },
  async saveDepartment(payload) {
    const managerIds = getDepartmentManagerIds(payload, users);
    if (payload.id) {
      departments = departments.map((item) => (item.id === payload.id ? { ...item, ...payload, managerIds } : item));
      return wait(departments.find((item) => item.id === payload.id));
    }
    const department = {
      id: `PB-${String(Math.max(0, ...departments.map((item) => Number(item.id.replace('PB-', '')) || 0)) + 1).padStart(3, '0')}`,
      name: payload.name,
      managerIds,
      phone: payload.phone || '',
      note: payload.note || '',
    };
    departments = [department, ...departments];
    return wait(department);
  },
  async deleteDepartment(id) {
    departments = departments.filter((item) => item.id !== id);
    return wait(id);
  },
};
