const wait = (value, ms = 280) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const roles = [
  'Trưởng phòng quản lý thiết bị',
  'Nhân viên phòng quản lý thiết bị',
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
];

let departments = [
  { id: 'PB-001', name: 'Phòng QLCSVC', manager: 'Nguyễn Văn Hòa', phone: '0901 111 222', note: 'Quản lý kho, tài sản và điều phối thiết bị.' },
  { id: 'PB-002', name: 'Phòng Đào tạo', manager: 'Nguyễn Minh Anh', phone: '0902 222 333', note: 'Quản lý khu giảng đường và lịch sử dụng phòng.' },
  { id: 'PB-003', name: 'Khoa CNTT', manager: 'Trần Bảo Long', phone: '0903 333 444', note: 'Quản lý phòng máy, lab và thiết bị CNTT.' },
  { id: 'PB-004', name: 'Phòng Hành chính', manager: 'Lê Thu Hà', phone: '0904 444 555', note: 'Quản lý khu văn phòng hành chính.' },
];

let stockQuantities = [
  { categoryId: 'DM-TB-01', quantity: 8, updatedAt: '2026-10-12' },
  { categoryId: 'DM-TB-02', quantity: 14, updatedAt: '2026-10-13' },
  { categoryId: 'DM-TB-03', quantity: 5, updatedAt: '2026-10-10' },
  { categoryId: 'DM-TB-04', quantity: 9, updatedAt: '2026-10-14' },
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
    name: 'Máy chiếu Epson EB-X51',
    category: 'Thiết bị trình chiếu',
    buildingId: 'TOA-A',
    floorId: 'A-2',
    roomId: 'A2.305',
    department: 'Phòng Đào tạo',
    room: 'A2.305',
    status: 'Đang sử dụng',
    condition: 'Tốt',
    owner: 'Nguyễn Minh Anh',
    nextMaintenance: '2026-11-12',
    warrantyExpiry: '2027-08-02',
    supplier: 'Công ty Thiết bị Giáo dục Minh Phát',
    importReceiptId: 'PN-1001',
  },
  {
    id: 'TB-00057',
    name: 'Laptop Dell Latitude 5440',
    category: 'Máy tính',
    buildingId: 'TOA-B',
    floorId: 'B-1',
    roomId: 'B1.204',
    department: 'Khoa CNTT',
    room: 'B1.204',
    status: 'Cho mượn',
    condition: 'Cần kiểm tra',
    owner: 'Trần Bảo Long',
    nextMaintenance: '2026-10-28',
    warrantyExpiry: '2027-05-18',
    supplier: 'Công ty Công nghệ Sao Việt',
    importReceiptId: 'PN-1016',
  },
  {
    id: 'TB-00063',
    name: 'Máy in Canon LBP 2900',
    category: 'Văn phòng',
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
    name: 'Bộ phát Wi-Fi Aruba AP-515',
    category: 'Hạ tầng mạng',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'C1.101',
    department: 'Phòng Hành chính',
    room: 'C1.101',
    status: 'Báo hỏng',
    condition: 'Hỏng',
    owner: 'Lê Thu Hà',
    nextMaintenance: '2026-10-16',
    warrantyExpiry: '2027-06-20',
    supplier: 'Công ty Hạ tầng Mạng Đông Dương',
    importReceiptId: 'PN-1008',
    damageReportId: 'BH-2026-041',
  },
  {
    id: 'TB-00081',
    name: 'Laptop Dell Latitude 5450',
    category: 'Máy tính',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Tốt',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2027-01-15',
  },
  {
    id: 'TB-00082',
    name: 'Máy chiếu Epson EB-E01',
    category: 'Thiết bị trình chiếu',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Tốt',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2027-02-10',
  },
  {
    id: 'TB-00083',
    name: 'Switch Cisco CBS250-24T-4G',
    category: 'Hạ tầng mạng',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Mới',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2027-03-01',
  },
  {
    id: 'TB-00084',
    name: 'Màn hình Dell P2422H',
    category: 'Máy tính',
    buildingId: 'TOA-A',
    floorId: 'A-1',
    roomId: 'A1.102',
    department: 'Khoa CNTT',
    room: 'A1.102',
    status: 'Đang sử dụng',
    condition: 'Tốt',
    owner: 'Trần Bảo Long',
    nextMaintenance: '2027-01-20',
  },
  {
    id: 'TB-00085',
    name: 'Máy in HP LaserJet Pro 4003dn',
    category: 'Văn phòng',
    buildingId: 'TOA-A',
    floorId: 'A-2',
    roomId: 'A2.305',
    department: 'Phòng Đào tạo',
    room: 'A2.305',
    status: 'Đang sử dụng',
    condition: 'Cần kiểm tra',
    owner: 'Nguyễn Minh Anh',
    nextMaintenance: '2026-11-25',
  },
  {
    id: 'TB-00090',
    name: 'Máy tính HP Compaq 6200 Pro',
    category: 'Máy tính',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Kém',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2026-09-15',
  },
  {
    id: 'TB-00091',
    name: 'Bộ lưu điện Santak TG500',
    category: 'Hạ tầng mạng',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'KHO-CSVC',
    department: 'Kho tổng',
    room: 'Kho CSVC',
    status: 'Trong kho',
    condition: 'Hỏng',
    owner: 'Phòng QLCSVC',
    nextMaintenance: '2026-08-30',
  },
  {
    id: 'TB-00092',
    name: 'Máy scan Canon DR-C240',
    category: 'Văn phòng',
    buildingId: 'TOA-C',
    floorId: 'C-1',
    roomId: 'C1.101',
    department: 'Phòng Hành chính',
    room: 'C1.101',
    status: 'Báo hỏng',
    condition: 'Cần kiểm tra',
    owner: 'Lê Thu Hà',
    nextMaintenance: '2026-10-22',
    warrantyExpiry: '2026-09-12',
    supplier: 'Công ty Thiết bị Văn phòng An Khang',
    importReceiptId: 'PN-0992',
    damageReportId: 'BH-2026-044',
  },
];

let tickets = [
  {
    id: 'PN-1027',
    type: 'Nhập kho',
    asset: '10 máy tính để bàn HP ProDesk',
    requester: 'Nhân viên phòng QL thiết bị',
    department: 'Kho tổng',
    status: 'Chờ duyệt',
    priority: 'Cao',
    createdAt: '2026-10-13',
  },
  {
    id: 'PM-2044',
    type: 'Mượn / Trả',
    asset: 'Máy chiếu Epson EB-X51',
    requester: 'Khoa CNTT',
    department: 'Phòng Đào tạo',
    status: 'Đang xử lý',
    priority: 'Trung bình',
    createdAt: '2026-10-12',
  },
  {
    id: 'PDC-3318',
    type: 'Điều chuyển',
    asset: 'Laptop Dell Latitude 5440',
    requester: 'Phòng Đào tạo',
    department: 'Khoa CNTT',
    status: 'Chờ duyệt',
    priority: 'Trung bình',
    createdAt: '2026-10-11',
  },
  {
    id: 'PSC-4482',
    type: 'Báo hỏng / Sửa chữa',
    asset: 'Bộ phát Wi-Fi Aruba AP-515',
    requester: 'Phòng Hành chính',
    department: 'Phòng QLCSVC',
    status: 'Cần xử lý',
    priority: 'Cao',
    createdAt: '2026-10-14',
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
      tickets: [...tickets],
      locations: structuredClone(locations),
      deviceCategories: structuredClone(deviceCategories),
      departments: structuredClone(departments),
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
    const needsImmediateHandling = ['Báo hỏng / Sửa chữa'].includes(payload.type);
    const initialStatus = payload.type === 'Bảo hành' ? 'Chờ xử lý' : needsImmediateHandling ? 'Cần xử lý' : 'Chờ duyệt';
    const ticket = {
      id: `P${Date.now().toString().slice(-5)}`,
      status: initialStatus,
      createdAt: new Date().toISOString().slice(0, 10),
      priority: payload.priority,
      type: payload.type,
      asset: payload.asset,
      requester: payload.requester,
      department: payload.department,
      details: payload,
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
          id: `ST-${Date.now()}-${group.categoryId}`,
          categoryId: group.categoryId,
          change,
          source: `Phiếu nhập kho #${ticket.id}`,
          date: today,
        }, ...stockTransactions];
      });
    }
    return wait(ticket);
  },
  async approveTicket(id) {
    tickets = tickets.map((ticket) => (ticket.id === id ? { ...ticket, status: 'Đã duyệt' } : ticket));
    return wait(tickets.find((ticket) => ticket.id === id));
  },
  async createRoom(payload) {
    const targetBuilding = locations.find((building) => building.id === payload.buildingId);
    if (!targetBuilding || targetBuilding.locked) return wait(null);
    let targetFloor = targetBuilding.floors.find((floor) => floor.id === payload.floorId);
    if (!targetFloor) {
      targetFloor = { id: payload.floorId, name: payload.floorName || payload.floorId, rooms: [] };
      targetBuilding.floors.push(targetFloor);
    }
    const room = {
      id: payload.roomCode,
      name: payload.roomCode,
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
    if (payload.id) {
      deviceCategories = deviceCategories.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
      return wait(deviceCategories.find((item) => item.id === payload.id));
    }
    const category = {
      id: `DM-TB-${String(deviceCategories.length + 1).padStart(2, '0')}`,
      name: payload.name,
      warrantyMonths: Number(payload.warrantyMonths) || 0,
      note: payload.note || '',
    };
    deviceCategories = [category, ...deviceCategories];
    return wait(category);
  },
  async deleteDeviceCategory(id) {
    deviceCategories = deviceCategories.filter((item) => item.id !== id);
    return wait(id);
  },
  async saveDepartment(payload) {
    if (payload.id) {
      departments = departments.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
      return wait(departments.find((item) => item.id === payload.id));
    }
    const department = {
      id: `PB-${String(departments.length + 1).padStart(3, '0')}`,
      name: payload.name,
      manager: payload.manager || '',
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
