import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BadgeCheck,
  Barcode,
  Building2,
  ClipboardCheck,
  DoorOpen,
  Edit3,
  FilePlus2,
  History,
  Layers,
  LayoutDashboard,
  Lock,
  Map,
  PackageCheck,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Settings,
  Tags,
  Truck,
  Trash2,
  Unlock,
  Users,
  Wrench,
} from 'lucide-react';
import { api, lifecycleSteps, roles } from './mockApi';

const modules = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'locations', label: 'Khu vực', icon: Map },
  { id: 'catalogs', label: 'Danh mục', icon: Tags },
  { id: 'warehouse', label: 'Nhập kho', icon: Barcode },
  { id: 'usage', label: 'Sử dụng', icon: PackageCheck },
  { id: 'maintenance', label: 'Bảo trì', icon: Wrench },
  { id: 'approval', label: 'Duyệt phiếu', icon: ClipboardCheck },
  { id: 'history', label: 'Lịch sử', icon: History },
  { id: 'diagrams', label: 'Sơ đồ', icon: Search },
];

const departmentStaffHiddenModules = ['catalogs', 'warehouse', 'maintenance', 'approval'];

const typeOptions = ['Nhập kho', 'Cấp phát', 'Mượn / Trả', 'Điều chuyển', 'Báo hỏng / Sửa chữa', 'Thu hồi', 'Thanh lý'];

const warehouseActions = [
  {
    key: 'import',
    type: 'Nhập kho',
    title: 'Tạo phiếu nhập kho',
    actionLabel: 'Tạo phiếu nhập',
    menuLabel: 'Nhập kho',
    assetLabel: 'Hàng hóa / thiết bị nhập',
    requesterLabel: 'Người yêu cầu nhận',
    departmentLabel: 'Kho tiếp nhận',
    requester: 'Nhân viên phòng QL thiết bị',
    department: 'Kho tổng',
    helper: 'Ghi nhận nhà cung cấp, hóa đơn và danh sách thiết bị để sinh mã tài sản khi hoàn tất nhập.',
  },
  {
    key: 'allocate',
    type: 'Cấp phát',
    title: 'Tạo phiếu cấp phát',
    actionLabel: 'Tạo phiếu cấp phát',
    menuLabel: 'Cấp phát',
    assetLabel: 'Thiết bị cấp phát',
    requesterLabel: 'Đơn vị được cấp phát',
    departmentLabel: 'Kho xuất',
    requester: 'Phòng Đào tạo',
    department: 'Kho tổng',
    helper: 'Cấp phát thiết bị từ kho tổng cho một phòng ban và chờ duyệt theo từng dòng thiết bị.',
  },
  {
    key: 'recall',
    type: 'Thu hồi',
    title: 'Tạo phiếu thu hồi',
    actionLabel: 'Tạo phiếu thu hồi',
    menuLabel: 'Thu hồi',
    assetLabel: 'Thiết bị thu hồi',
    requesterLabel: 'Phòng ban bị thu hồi',
    departmentLabel: 'Nơi tiếp nhận',
    requester: 'Khoa CNTT',
    department: 'Kho tổng',
    helper: 'Thu hồi thiết bị đang thuộc phạm vi sử dụng/quản lý của một phòng ban về kho.',
  },
  {
    key: 'liquidate',
    type: 'Thanh lý',
    title: 'Tạo phiếu thanh lý',
    actionLabel: 'Tạo phiếu thanh lý',
    menuLabel: 'Thanh lý',
    assetLabel: 'Thiết bị thanh lý',
    requesterLabel: 'Đơn vị đề xuất',
    departmentLabel: 'Đơn vị xử lý',
    requester: 'Phòng QLCSVC',
    department: 'Kho tổng',
    helper: 'Lập danh sách thiết bị cuối vòng đời để trình duyệt và ghi nhận kết quả thanh lý.',
  },
];

const usageActions = [
  {
    key: 'borrow-return',
    type: 'Mượn / Trả',
    title: 'Tạo phiếu mượn thiết bị',
    actionLabel: 'Tạo phiếu mượn / trả',
    menuLabel: 'Mượn / trả',
    assetLabel: 'Thiết bị mượn',
    requesterLabel: 'Người / đơn vị mượn',
    departmentLabel: 'Đơn vị quản lý thiết bị',
    requester: 'Khoa CNTT',
    department: 'Phòng Đào tạo',
    helper: 'Tạo phiếu gồm thông tin người mượn và danh sách thiết bị, sau khi duyệt mới ghi nhận trạng thái đang mượn hoặc đã trả.',
  },
  {
    key: 'transfer',
    type: 'Điều chuyển',
    title: 'Tạo phiếu điều chuyển',
    actionLabel: 'Tạo phiếu điều chuyển',
    menuLabel: 'Điều chuyển',
    assetLabel: 'Thiết bị điều chuyển',
    requesterLabel: 'Phòng ban ban đầu',
    departmentLabel: 'Phòng ban nhận',
    requester: 'Phòng Đào tạo',
    department: 'Khoa CNTT',
    helper: 'Điều chuyển thiết bị sang phòng ban khác và chuyển trách nhiệm quản lý sau khi được duyệt.',
  },
  {
    key: 'damage-report',
    type: 'Báo hỏng / Sửa chữa',
    title: 'Tạo phiếu báo hỏng',
    actionLabel: 'Tạo phiếu báo hỏng',
    menuLabel: 'Báo hỏng',
    assetLabel: 'Thiết bị báo hỏng',
    requesterLabel: 'Người / đơn vị báo hỏng',
    departmentLabel: 'Đơn vị xử lý',
    requester: 'Phòng Hành chính',
    department: 'Phòng QLCSVC',
    helper: 'Ghi nhận tình trạng hỏng thực tế để bộ phận CSVC phân loại sửa chữa, bảo trì hoặc bảo hành.',
  },
];

const maintenanceActions = [
  {
    key: 'maintenance',
    type: 'Bảo trì',
    title: 'Tạo phiếu bảo trì',
    actionLabel: 'Tạo phiếu bảo trì',
    menuLabel: 'Bảo trì',
    assetLabel: 'Thiết bị bảo trì',
    requesterLabel: 'Người lập phiếu',
    departmentLabel: 'Đơn vị phụ trách',
    requester: 'Nhân viên phòng QL thiết bị',
    department: 'Phòng QLCSVC',
    helper: 'Tạo phiếu bảo trì định kỳ hoặc đột xuất, duyệt theo từng thiết bị rồi ghi nhận kết quả hoàn thành.',
  },
  {
    key: 'repair',
    type: 'Sửa chữa',
    title: 'Tạo phiếu sửa chữa',
    actionLabel: 'Tạo phiếu sửa chữa',
    menuLabel: 'Sửa chữa',
    assetLabel: 'Thiết bị sửa chữa',
    requesterLabel: 'Đơn vị yêu cầu',
    departmentLabel: 'Đơn vị sửa chữa',
    requester: 'Phòng Hành chính',
    department: 'Phòng QLCSVC',
    helper: 'Lập phiếu sửa chữa cho thiết bị hỏng, theo dõi duyệt, thực hiện và kết quả sửa chữa.',
  },
  {
    key: 'warranty',
    type: 'Bảo hành',
    title: 'Tạo phiếu bảo hành',
    actionLabel: 'Tạo phiếu bảo hành',
    menuLabel: 'Bảo hành',
    assetLabel: 'Thiết bị bảo hành',
    requesterLabel: 'Đơn vị bàn giao',
    departmentLabel: 'Đơn vị tiếp nhận / nhà cung cấp',
    requester: 'Phòng QLCSVC',
    department: 'Nhà cung cấp',
    helper: 'Kiểm tra điều kiện bảo hành, bàn giao thiết bị đi bảo hành và ghi nhận kết quả khi tiếp nhận lại.',
  },
];

const statusTone = {
  'Đang sử dụng': 'green',
  'Cho mượn': 'blue',
  'Trong kho': 'neutral',
  'Báo hỏng': 'red',
  'Chờ duyệt': 'amber',
  'Đang xử lý': 'blue',
  'Cần xử lý': 'red',
  'Chờ xử lý': 'amber',
  'Đã duyệt': 'green',
};

function App() {
  const [active, setActive] = useState('dashboard');
  const [role, setRole] = useState(roles[1]);
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    type: 'Cấp phát',
    asset: '',
    requester: 'Phòng Đào tạo',
    department: 'Kho tổng',
    priority: 'Trung bình',
  });
  const [roomForm, setRoomForm] = useState({
    buildingId: 'TOA-A',
    floorId: 'A-2',
    floorName: 'Tầng 2',
    roomCode: '',
    functionName: 'Phòng học',
    department: 'Phòng Đào tạo',
  });

  useEffect(() => {
    api.getDashboard().then(setData);
  }, []);

  const visibleModules = useMemo(
    () => modules.filter((module) => role !== roles[2] || !departmentStaffHiddenModules.includes(module.id)),
    [role],
  );
  const canOpenModule = (id) => visibleModules.some((module) => module.id === id);
  const currentActive = canOpenModule(active) ? active : 'dashboard';

  useEffect(() => {
    if (!canOpenModule(active)) {
      setActive('dashboard');
    }
  }, [active, visibleModules]);

  const filteredAssets = useMemo(() => {
    if (!data) return [];
    const text = query.trim().toLowerCase();
    if (!text) return data.assets;
    return data.assets.filter((asset) => `${asset.id} ${asset.name} ${asset.department} ${asset.room}`.toLowerCase().includes(text));
  }, [data, query]);

  const refresh = async () => setData(await api.getDashboard());

  const createTicket = async (event, overridePayload) => {
    event.preventDefault();
    const payload = overridePayload || form;
    if (!payload.asset?.trim()) return;
    await api.createTicket(payload);
    setForm({ ...form, asset: '' });
    await refresh();
    setActive(canOpenModule('approval') ? 'approval' : 'usage');
  };

  const createRoom = async (event) => {
    event.preventDefault();
    if (!roomForm.roomCode.trim()) return;
    await api.createRoom({ ...roomForm, roomCode: roomForm.roomCode.trim().toUpperCase() });
    setRoomForm({ ...roomForm, roomCode: '' });
    await refresh();
  };

  const toggleBuildingLock = async (buildingId) => {
    await api.toggleBuildingLock(buildingId);
    await refresh();
  };

  const toggleRoomLock = async (roomId) => {
    await api.toggleRoomLock(roomId);
    await refresh();
  };

  const approveTicket = async (id) => {
    await api.approveTicket(id);
    await refresh();
  };

  if (!data) {
    return <div className="loading">Đang tải prototype...</div>;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Building2 size={22} /></div>
          <div>
            <strong>QL CSVC</strong>
            <span>Bản mẫu React</span>
          </div>
        </div>
        <nav>
          {visibleModules.map(({ id, label, icon: Icon }) => (
            <button className={active === id ? 'active' : ''} key={id} onClick={() => setActive(id)} title={label}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Hệ thống quản lý cơ sở vật chất</p>
            <h1>{modules.find((item) => item.id === currentActive)?.label}</h1>
          </div>
          <div className="top-actions">
            <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Chọn vai trò">
              {roles.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="icon-button" onClick={refresh} title="Tải lại dữ liệu mẫu">
              <RefreshCcw size={18} />
            </button>
          </div>
        </header>

        {currentActive === 'dashboard' && <Dashboard data={data} setActive={setActive} canOpenModule={canOpenModule} />}
        {currentActive === 'locations' && (
          <Locations
            data={data}
            roomForm={roomForm}
            setRoomForm={setRoomForm}
            createRoom={createRoom}
            toggleBuildingLock={toggleBuildingLock}
            toggleRoomLock={toggleRoomLock}
          />
        )}
        {currentActive === 'catalogs' && <Catalogs data={data} refresh={refresh} />}
        {currentActive === 'warehouse' && <Warehouse data={data} form={form} setForm={setForm} createTicket={createTicket} />}
        {currentActive === 'usage' && <Usage data={data} form={form} setForm={setForm} createTicket={createTicket} />}
        {currentActive === 'maintenance' && <Maintenance data={data} form={form} setForm={setForm} createTicket={createTicket} />}
        {currentActive === 'approval' && <Approval data={data} role={role} approveTicket={approveTicket} />}
        {currentActive === 'history' && <AssetHistory data={data} query={query} setQuery={setQuery} filteredAssets={filteredAssets} />}
        {currentActive === 'diagrams' && <Diagrams />}
      </main>
    </div>
  );
}

function Dashboard({ data, setActive, canOpenModule }) {
  const stats = [
    ['Tổng thiết bị', data.stats.total, Archive],
    ['Trong kho', data.stats.inStock, Truck],
    ['Đang sử dụng', data.stats.inUse, Users],
    ['Phòng đang quản lý', data.stats.rooms, DoorOpen],
  ];

  return (
    <section className="screen">
      <div className="stats-grid">
        {stats.map(([label, value, Icon]) => (
          <article className="metric" key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="workflow-band">
        {lifecycleSteps.map((step, index) => (
          <div className="flow-step" key={step.key}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step.title}</strong>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="split">
        <TicketTable tickets={data.tickets.slice(0, 4)} compact />
        <div className="panel">
          <h2>Thao tác nhanh</h2>
          {canOpenModule('warehouse') ? <button onClick={() => setActive('warehouse')}><FilePlus2 size={18} />Tạo phiếu nhập/cấp phát</button> : null}
          <button onClick={() => setActive('locations')}><Building2 size={18} />Quản lý tòa, tầng, phòng</button>
          {canOpenModule('maintenance') ? <button onClick={() => setActive('maintenance')}><Wrench size={18} />Báo hỏng hoặc bảo trì</button> : null}
          {canOpenModule('approval') ? <button onClick={() => setActive('approval')}><BadgeCheck size={18} />Mở hàng đợi duyệt</button> : null}
        </div>
      </div>
    </section>
  );
}

function Locations({ data, roomForm, setRoomForm, createRoom, toggleBuildingLock, toggleRoomLock }) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const assetCountByRoom = data.assets.reduce((map, asset) => {
    map[asset.roomId] = (map[asset.roomId] || 0) + 1;
    return map;
  }, {});

  const selectedBuilding = data.locations.find((building) => building.id === roomForm.buildingId) || data.locations[0];
  const submitRoom = async (event) => {
    await createRoom(event);
    setIsCreatingRoom(false);
  };

  return (
    <section className="screen split locations-layout">
      <div className="panel location-tree">
        <div className="panel-head">
          <h2>Cấu trúc khu vực</h2>
          <div className="panel-actions">
            <span className="role-chip">Tòa / tầng / phòng</span>
            <button className="mini-add-button" type="button" onClick={() => setIsCreatingRoom(true)} title="Tạo phòng mới">
              <Plus size={17} />
            </button>
          </div>
        </div>
        {data.locations.map((building) => {
          const roomCount = building.floors.reduce((total, floor) => total + floor.rooms.length, 0);
          const assetCount = building.floors.reduce((total, floor) => total + floor.rooms.reduce((sum, room) => sum + (assetCountByRoom[room.id] || 0), 0), 0);
          return (
            <article className="location-building" key={building.id}>
              <div className="location-building-head">
                <Building2 size={19} />
                <div>
                  <strong>{building.name}</strong>
                  <small>{building.note} - {roomCount} phòng - {assetCount} thiết bị</small>
                </div>
                <button className={building.locked ? 'lock danger' : 'lock'} onClick={() => toggleBuildingLock(building.id)}>
                  {building.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  {building.locked ? 'Đang khóa' : 'Đang mở'}
                </button>
              </div>
              {building.floors.map((floor) => (
                <div className="floor-branch" key={floor.id}>
                  <div className="floor-title"><Layers size={16} />{floor.name}</div>
                  <div className="room-list">
                    {floor.rooms.map((room) => (
                      <div className={`room-row ${room.locked ? 'is-locked' : ''}`} key={room.id}>
                        <div>
                          <strong>{room.name}</strong>
                          <small>{room.function}</small>
                          <small>{room.department}</small>
                        </div>
                        <span>{assetCountByRoom[room.id] || 0} TB</span>
                        <button onClick={() => toggleRoomLock(room.id)} title="Khóa hoặc mở khóa phòng">
                          {room.locked ? <Lock size={15} /> : <Unlock size={15} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </article>
          );
        })}
      </div>

      {isCreatingRoom ? (
        <form className="panel request-form" onSubmit={submitRoom}>
          <div className="panel-head">
            <h2>Tạo phòng mẫu</h2>
            <button className="ghost-button" type="button" onClick={() => setIsCreatingRoom(false)}>Đóng</button>
          </div>
          <label>
            Tòa trực thuộc
            <select
              value={roomForm.buildingId}
              onChange={(event) => {
                const nextBuilding = data.locations.find((building) => building.id === event.target.value);
                const nextFloor = nextBuilding?.floors[0];
                setRoomForm({
                  ...roomForm,
                  buildingId: event.target.value,
                  floorId: nextFloor?.id || '',
                  floorName: nextFloor?.name || '',
                });
              }}
            >
              {data.locations.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
            </select>
          </label>
          <label>
            Tầng
            <select
              value={roomForm.floorId}
              onChange={(event) => {
                const floor = selectedBuilding.floors.find((item) => item.id === event.target.value);
                setRoomForm({ ...roomForm, floorId: event.target.value, floorName: floor?.name || event.target.value });
              }}
            >
              {selectedBuilding.floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name}</option>)}
            </select>
          </label>
          <label>
            Mã / số hiệu phòng
            <input required value={roomForm.roomCode} onChange={(event) => setRoomForm({ ...roomForm, roomCode: event.target.value })} placeholder="VD: A2.306" />
          </label>
          <label>
            Công năng phòng
            <input value={roomForm.functionName} onChange={(event) => setRoomForm({ ...roomForm, functionName: event.target.value })} />
          </label>
          <label>
            Đơn vị phụ trách
            <input value={roomForm.department} onChange={(event) => setRoomForm({ ...roomForm, department: event.target.value })} />
          </label>
          <button className="primary" type="submit"><DoorOpen size={18} />Tạo phòng</button>
        </form>
      ) : (
        <div className="panel create-card">
          <h2>Quản lý phòng</h2>
          <button className="primary" type="button" onClick={() => setIsCreatingRoom(true)}><DoorOpen size={18} />Tạo phòng</button>
          <div className="rules">
            <strong>Quy tắc từ tài liệu</strong>
            <p>Tòa/phòng mới khởi tạo ở trạng thái chưa khóa, thao tác tạo/sửa/khóa ghi nhận người thực hiện và thời gian. Khóa tòa sẽ khóa các phòng phụ thuộc.</p>
          </div>
        </div>
      )}
    </section>
  );
}

const emptyCategoryForm = { id: '', name: '', warrantyMonths: 12, note: '' };
const emptyDepartmentForm = { id: '', name: '', manager: '', phone: '', note: '' };

function Catalogs({ data, refresh }) {
  const [tab, setTab] = useState('devices');
  const [deviceQuery, setDeviceQuery] = useState('');
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);

  const filteredCategories = useMemo(() => {
    const text = deviceQuery.trim().toLowerCase();
    if (!text) return data.deviceCategories;
    return data.deviceCategories.filter((item) => `${item.id} ${item.name} ${item.note}`.toLowerCase().includes(text));
  }, [data.deviceCategories, deviceQuery]);

  const filteredDepartments = useMemo(() => {
    const text = departmentQuery.trim().toLowerCase();
    if (!text) return data.departments;
    return data.departments.filter((item) => `${item.id} ${item.name} ${item.manager} ${item.phone} ${item.note}`.toLowerCase().includes(text));
  }, [data.departments, departmentQuery]);

  const saveCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return;
    await api.saveDeviceCategory(categoryForm);
    setCategoryForm(emptyCategoryForm);
    await refresh();
  };

  const saveDepartment = async (event) => {
    event.preventDefault();
    if (!departmentForm.name.trim()) return;
    await api.saveDepartment(departmentForm);
    setDepartmentForm(emptyDepartmentForm);
    await refresh();
  };

  const removeCategory = async (id) => {
    await api.deleteDeviceCategory(id);
    await refresh();
  };

  const removeDepartment = async (id) => {
    await api.deleteDepartment(id);
    await refresh();
  };

  return (
    <section className="screen">
      <div className="catalog-tabs" role="tablist" aria-label="Chọn danh mục">
        <button className={tab === 'devices' ? 'active' : ''} onClick={() => setTab('devices')} type="button">
          <Tags size={17} />Danh mục thiết bị
        </button>
        <button className={tab === 'departments' ? 'active' : ''} onClick={() => setTab('departments')} type="button">
          <Users size={17} />Danh mục phòng ban
        </button>
      </div>

      {tab === 'devices' ? (
        <section className="split wide catalog-layout">
          <CatalogForm title={categoryForm.id ? 'Sửa loại thiết bị' : 'Thêm loại thiết bị'} onSubmit={saveCategory} onCancel={() => setCategoryForm(emptyCategoryForm)}>
            <label>
              Tên loại thiết bị
              <input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="VD: Thiết bị trình chiếu" />
            </label>
            <label>
              Bảo hành mặc định (tháng)
              <input type="number" min="0" value={categoryForm.warrantyMonths} onChange={(event) => setCategoryForm({ ...categoryForm, warrantyMonths: event.target.value })} />
            </label>
            <label>
              Ghi chú
              <input value={categoryForm.note} onChange={(event) => setCategoryForm({ ...categoryForm, note: event.target.value })} placeholder="Mô tả ngắn về nhóm thiết bị" />
            </label>
          </CatalogForm>
          <div className="panel table-panel">
            <CatalogHeader title="Loại thiết bị" query={deviceQuery} setQuery={setDeviceQuery} placeholder="Tìm mã, tên loại, ghi chú..." />
            <div className="table catalog-table devices">
              <div className="table-row table-head"><span>Mã</span><span>Tên loại</span><span>Bảo hành</span><span>Ghi chú</span><span></span></div>
              {filteredCategories.map((item) => (
                <div className="table-row" key={item.id}>
                  <span>{item.id}</span>
                  <span><strong>{item.name}</strong></span>
                  <span>{item.warrantyMonths} tháng</span>
                  <span><small>{item.note}</small></span>
                  <RowActions onEdit={() => setCategoryForm(item)} onDelete={() => removeCategory(item.id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="split wide catalog-layout">
          <CatalogForm title={departmentForm.id ? 'Sửa phòng ban' : 'Thêm phòng ban'} onSubmit={saveDepartment} onCancel={() => setDepartmentForm(emptyDepartmentForm)}>
            <label>
              Tên phòng ban
              <input required value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} placeholder="VD: Phòng Đào tạo" />
            </label>
            <label>
              Người phụ trách
              <input value={departmentForm.manager} onChange={(event) => setDepartmentForm({ ...departmentForm, manager: event.target.value })} placeholder="Họ tên người phụ trách" />
            </label>
            <label>
              Số điện thoại
              <input value={departmentForm.phone} onChange={(event) => setDepartmentForm({ ...departmentForm, phone: event.target.value })} placeholder="VD: 0901 111 222" />
            </label>
            <label>
              Ghi chú
              <input value={departmentForm.note} onChange={(event) => setDepartmentForm({ ...departmentForm, note: event.target.value })} placeholder="Phạm vi quản lý / mô tả ngắn" />
            </label>
          </CatalogForm>
          <div className="panel table-panel">
            <CatalogHeader title="Phòng ban" query={departmentQuery} setQuery={setDepartmentQuery} placeholder="Tìm mã, tên, người phụ trách..." />
            <div className="table catalog-table departments">
              <div className="table-row table-head"><span>Mã</span><span>Phòng ban</span><span>Người phụ trách</span><span>Điện thoại</span><span>Ghi chú</span><span></span></div>
              {filteredDepartments.map((item) => (
                <div className="table-row" key={item.id}>
                  <span>{item.id}</span>
                  <span><strong>{item.name}</strong></span>
                  <span>{item.manager}</span>
                  <span>{item.phone}</span>
                  <span><small>{item.note}</small></span>
                  <RowActions onEdit={() => setDepartmentForm(item)} onDelete={() => removeDepartment(item.id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

function CatalogHeader({ title, query, setQuery, placeholder }) {
  return (
    <div className="catalog-header">
      <h2>{title}</h2>
      <div className="searchbox catalog-search">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
      </div>
    </div>
  );
}

function CatalogForm({ title, children, onSubmit, onCancel }) {
  return (
    <form className="panel request-form catalog-form" onSubmit={onSubmit}>
      <div className="panel-head">
        <h2>{title}</h2>
        <button className="ghost-button" type="button" onClick={onCancel}>Xóa form</button>
      </div>
      {children}
      <button className="primary" type="submit"><Save size={18} />Lưu danh mục</button>
    </form>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <span className="row-actions">
      <button type="button" onClick={onEdit} title="Sửa">
        <Edit3 size={15} />
      </button>
      <button className="danger" type="button" onClick={onDelete} title="Xóa">
        <Trash2 size={15} />
      </button>
    </span>
  );
}

const createImportGroup = (categories) => ({
  id: `group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  categoryId: categories[0]?.id || '',
  quantity: 1,
  items: [{ key: `item-${Date.now()}-0`, assetId: '', barcode: '' }],
});

function ImportReceiptForm({ data, createTicket, onClose }) {
  const [receipt, setReceipt] = useState({
    supplier: '',
    carrier: '',
    requestCode: '',
    deliveryDate: new Date().toISOString().slice(0, 10),
    deliveryBatch: 'Đợt 1',
    requestDepartmentId: data.departments[0]?.id || '',
  });
  const [groups, setGroups] = useState([createImportGroup(data.deviceCategories)]);
  const [labelsReady, setLabelsReady] = useState(false);

  const makeAutoAssetId = (group, index) => `AUTO-${group.categoryId || 'TB'}-${Date.now().toString().slice(-5)}-${index + 1}`;
  const makeBarcode = (assetId) => `BC-${assetId.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`;

  const barcodePreview = useMemo(() => groups.flatMap((group) => {
    const category = data.deviceCategories.find((item) => item.id === group.categoryId);
    return group.items.map((item, index) => ({
      key: `${group.id}-${item.key}`,
      categoryName: category?.name || 'Chưa chọn loại',
      order: index + 1,
      assetId: item.assetId,
      barcode: item.barcode,
      autoGenerated: item.autoGenerated,
    }));
  }), [data.deviceCategories, groups]);

  const updateGroup = (groupId, patch) => {
    setLabelsReady(false);
    setGroups((current) => current.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        ...patch,
        items: group.items.map((item) => ({ ...item, barcode: '', autoGenerated: false })),
      };
    }));
  };

  const updateQuantity = (groupId, value) => {
    setLabelsReady(false);
    const quantity = Math.max(1, Number(value) || 1);
    setGroups((current) => current.map((group) => {
      if (group.id !== groupId) return group;
      const items = Array.from({ length: quantity }, (_, index) => group.items[index] || { key: `${group.id}-item-${index}`, assetId: '', barcode: '' });
      return { ...group, quantity, items };
    }));
  };

  const updateItemId = (groupId, itemKey, assetId) => {
    setLabelsReady(false);
    setGroups((current) => current.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map((item) => (item.key === itemKey ? { ...item, assetId, barcode: '', autoGenerated: false } : item)),
      };
    }));
  };

  const addGroup = () => {
    setLabelsReady(false);
    setGroups((current) => [...current, createImportGroup(data.deviceCategories)]);
  };
  const removeGroup = (groupId) => {
    setLabelsReady(false);
    setGroups((current) => (current.length === 1 ? current : current.filter((group) => group.id !== groupId)));
  };
  const buildGroupsWithBarcodes = (current) => current.map((group) => ({
    ...group,
    items: group.items.map((item, index) => {
      const assetId = item.assetId.trim() || makeAutoAssetId(group, index);
      return {
        ...item,
        assetId,
        barcode: makeBarcode(assetId),
        autoGenerated: !item.assetId.trim(),
      };
    }),
  }));

  const generateAndPrintLabels = () => {
    setGroups((current) => buildGroupsWithBarcodes(current));
    setLabelsReady(true);
  };

  const ensureBarcodes = () => groups.map((group) => {
    const category = data.deviceCategories.find((item) => item.id === group.categoryId);
    const groupWithBarcode = buildGroupsWithBarcodes([group])[0];
    return {
      ...groupWithBarcode,
      categoryName: category?.name || 'Chưa chọn loại',
    };
  });

  const submitImport = async (event) => {
    const requestDepartment = data.departments.find((department) => department.id === receipt.requestDepartmentId);
    const enrichedGroups = ensureBarcodes();
    const totalQuantity = enrichedGroups.reduce((sum, group) => sum + group.items.length, 0);
    const assetSummary = enrichedGroups.map((group) => `${group.categoryName} (${group.items.length})`).join(', ');

    await createTicket(event, {
      type: 'Nhập kho',
      asset: assetSummary,
      requester: requestDepartment?.name || 'Phòng ban yêu cầu',
      department: 'Kho tổng',
      priority: 'Trung bình',
      supplier: receipt.supplier,
      carrier: receipt.carrier,
      requestCode: receipt.requestCode,
      deliveryDate: receipt.deliveryDate,
      deliveryBatch: receipt.deliveryBatch,
      requestDepartmentId: receipt.requestDepartmentId,
      importItems: enrichedGroups,
      totalQuantity,
      barcodeGenerated: true,
      labelsReady,
    });
    onClose();
  };

  return (
    <form className="panel request-form import-form" onSubmit={submitImport}>
      <div className="panel-head">
        <h2>Tạo phiếu nhập kho</h2>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Ghi nhận thông tin giao hàng, phòng ban yêu cầu và danh sách thiết bị nhập theo từng loại.</p>

      <div className="form-grid two">
        <label>
          Nhà cung cấp
          <input required value={receipt.supplier} onChange={(event) => setReceipt({ ...receipt, supplier: event.target.value })} placeholder="VD: Công ty Thiết bị ABC" />
        </label>
        <label>
          Đơn vị vận chuyển
          <input value={receipt.carrier} onChange={(event) => setReceipt({ ...receipt, carrier: event.target.value })} placeholder="VD: Giao Hàng Nhanh" />
        </label>
        <label>
          Mã phiếu yêu cầu
          <input required value={receipt.requestCode} onChange={(event) => setReceipt({ ...receipt, requestCode: event.target.value })} placeholder="VD: YC-2026-014" />
        </label>
        <label>
          Ngày giao
          <input type="date" required value={receipt.deliveryDate} onChange={(event) => setReceipt({ ...receipt, deliveryDate: event.target.value })} />
        </label>
        <label>
          Đợt giao
          <input value={receipt.deliveryBatch} onChange={(event) => setReceipt({ ...receipt, deliveryBatch: event.target.value })} placeholder="VD: Đợt 1" />
        </label>
        <label>
          Phòng ban yêu cầu
          <select value={receipt.requestDepartmentId} onChange={(event) => setReceipt({ ...receipt, requestDepartmentId: event.target.value })}>
            {data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>
      </div>

      <div className="import-section">
        <div className="panel-head">
          <h2>Thiết bị nhập</h2>
          <button className="mini-add-button" type="button" onClick={addGroup} title="Thêm loại thiết bị">
            <Plus size={17} />
          </button>
        </div>
        {groups.map((group, groupIndex) => {
          const category = data.deviceCategories.find((item) => item.id === group.categoryId);
          return (
            <div className="import-group" key={group.id}>
              <div className="import-group-head">
                <strong>Loại thiết bị {groupIndex + 1}</strong>
                <button className="ghost-button danger-text" type="button" onClick={() => removeGroup(group.id)}>Xóa</button>
              </div>
              <div className="form-grid two compact">
                <label>
                  Loại thiết bị
                  <select value={group.categoryId} onChange={(event) => updateGroup(group.id, { categoryId: event.target.value })}>
                    {data.deviceCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  Số lượng
                  <input type="number" min="1" value={group.quantity} onChange={(event) => updateQuantity(group.id, event.target.value)} />
                </label>
              </div>
              <div className="item-list">
                {group.items.map((item, index) => (
                  <label className="item-id-row" key={item.key}>
                    <span>{category?.name || 'Thiết bị'} #{index + 1}</span>
                    <input value={item.assetId} onChange={(event) => updateItemId(group.id, item.key, event.target.value)} placeholder="Để trống để tự sinh ID" />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="barcode-print-section">
        <div className="panel-head">
          <h2>Sinh & in tem mã vạch</h2>
          <button className="primary compact-button" type="button" onClick={generateAndPrintLabels}>
            <Barcode size={18} />Sinh & in tem
          </button>
        </div>
        <p className="form-helper">Hệ thống dùng ID nhập tay hoặc tự sinh ID cho item còn trống, sau đó tạo tem mã vạch để dán lên thiết bị trước khi đưa hàng vào kho.</p>
        <div className="barcode-preview">
          <div className="barcode-row barcode-head"><span>Loại thiết bị</span><span>ID thiết bị</span><span>Mã in trên tem</span><span>Nguồn ID</span></div>
          {barcodePreview.map((item) => (
            <div className="barcode-row" key={item.key}>
              <span>{item.categoryName} #{item.order}</span>
              <span>{item.assetId || 'Chưa sinh'}</span>
              <span>{item.barcode || 'Chưa in tem'}</span>
              <span className={`pill ${item.autoGenerated ? 'amber' : 'neutral'}`}>{item.autoGenerated ? 'Tự sinh' : 'Nhập tay'}</span>
            </div>
          ))}
        </div>
        <div className="label-grid">
          {barcodePreview.map((item) => (
            <BarcodeLabel key={item.key} item={item} ready={labelsReady && Boolean(item.barcode)} />
          ))}
        </div>
      </div>
      <button className="primary" type="submit"><FilePlus2 size={18} />Xác nhận nhập kho</button>
    </form>
  );
}

function BarcodeLabel({ item, ready }) {
  const code = item.barcode || 'CHƯA SINH';
  const bars = Array.from(code).slice(0, 28).map((char, index) => ((char.charCodeAt(0) + index) % 4) + 1);

  return (
    <div className={`barcode-label ${ready ? 'ready' : ''}`}>
      <div>
        <strong>{item.assetId || 'Chưa có ID'}</strong>
        <small>{item.categoryName} #{item.order}</small>
      </div>
      <div className="barcode-art" aria-label={code}>
        {bars.map((width, index) => <i key={`${code}-${index}`} style={{ width: `${width}px` }} />)}
      </div>
      <span>{code}</span>
    </div>
  );
}

const flattenRooms = (locations) => locations.flatMap((building) => building.floors.flatMap((floor) => floor.rooms.map((room) => ({
  ...room,
  buildingName: building.name,
  floorName: floor.name,
}))));

function AllocationReceiptForm({ data, createTicket, onClose }) {
  const rooms = useMemo(() => flattenRooms(data.locations), [data.locations]);
  const initialDepartmentId = data.departments.find((item) => item.name === 'Phòng Đào tạo')?.id || data.departments[0]?.id || '';
  const initialDepartment = data.departments.find((item) => item.id === initialDepartmentId);
  const initialRoom = rooms.find((room) => room.department === initialDepartment?.name && !room.locked);
  const [receipt, setReceipt] = useState({
    departmentId: initialDepartmentId,
    roomId: initialRoom?.id || '',
    requestCode: '',
    expectedDate: new Date().toISOString().slice(0, 10),
    expectedRecipient: initialDepartment?.manager || '',
    purpose: '',
    priority: 'Trung bình',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');

  const selectedDepartment = data.departments.find((item) => item.id === receipt.departmentId);
  const availableRooms = rooms.filter((room) => room.department === selectedDepartment?.name && !room.locked);
  const eligibleAssets = data.assets.filter((asset) => asset.status === 'Trong kho' && asset.condition !== 'Hỏng');
  const normalizedQuery = assetQuery.trim().toLocaleLowerCase('vi');
  const filteredAssets = eligibleAssets.filter((asset) => {
    if (!normalizedQuery) return true;
    return `${asset.id} ${asset.name} ${asset.category}`.toLocaleLowerCase('vi').includes(normalizedQuery);
  });
  const selectedAssets = selectedAssetIds
    .map((id) => eligibleAssets.find((asset) => asset.id === id))
    .filter(Boolean);

  const changeDepartment = (departmentId) => {
    const department = data.departments.find((item) => item.id === departmentId);
    const firstRoom = rooms.find((room) => room.department === department?.name && !room.locked);
    setReceipt((current) => ({
      ...current,
      departmentId,
      roomId: firstRoom?.id || '',
      expectedRecipient: department?.manager || '',
    }));
  };

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => (
      current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]
    ));
  };

  const submitAllocation = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length) return;
    const selectedRoom = rooms.find((room) => room.id === receipt.roomId);
    const assetSummary = selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', ');

    await createTicket(event, {
      type: 'Cấp phát',
      asset: assetSummary,
      requester: selectedDepartment?.name || 'Phòng ban nhận',
      department: 'Kho tổng',
      priority: receipt.priority,
      requestCode: receipt.requestCode,
      expectedDate: receipt.expectedDate,
      expectedRecipient: receipt.expectedRecipient,
      purpose: receipt.purpose,
      note: receipt.note,
      targetRoomId: receipt.roomId,
      targetRoomName: selectedRoom?.name || '',
      allocationItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        category: asset.category,
        approvalStatus: 'Chờ duyệt',
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitAllocation}>
      <div className="panel-head">
        <div>
          <p className="section-kicker">Phiếu CP - hệ thống tự sinh mã</p>
          <h2>Tạo phiếu cấp phát</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Lập đề nghị cấp phát cho một phòng ban. Kết quả bàn giao và thời gian cấp phát thực tế sẽ được ghi nhận sau khi từng thiết bị được duyệt.</p>

      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div><strong>Thông tin nơi nhận</strong><small>Một phiếu chỉ áp dụng cho một phòng ban.</small></div>
        </div>
        <div className="form-grid two">
          <label>
            Phòng ban được cấp phát
            <select value={receipt.departmentId} onChange={(event) => changeDepartment(event.target.value)}>
              {data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label>
            Phòng / vị trí nhận
            <select value={receipt.roomId} onChange={(event) => setReceipt({ ...receipt, roomId: event.target.value })}>
              <option value="">Chưa xác định phòng</option>
              {availableRooms.map((room) => <option key={room.id} value={room.id}>{room.name} - {room.buildingName}, {room.floorName}</option>)}
            </select>
          </label>
          <label>
            Người tiếp nhận dự kiến
            <input required value={receipt.expectedRecipient} onChange={(event) => setReceipt({ ...receipt, expectedRecipient: event.target.value })} placeholder="Họ tên người phụ trách" />
          </label>
          <label>
            Ngày cấp phát dự kiến
            <input type="date" required value={receipt.expectedDate} onChange={(event) => setReceipt({ ...receipt, expectedDate: event.target.value })} />
          </label>
          <label>
            Mã yêu cầu / đề xuất
            <input value={receipt.requestCode} onChange={(event) => setReceipt({ ...receipt, requestCode: event.target.value })} placeholder="VD: YC-CP-2026-018" />
          </label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option>
              <option>Trung bình</option>
              <option>Cao</option>
            </select>
          </label>
        </div>
        <label>
          Mục đích sử dụng
          <textarea required rows="3" value={receipt.purpose} onChange={(event) => setReceipt({ ...receipt, purpose: event.target.value })} placeholder="Mô tả nhu cầu và mục đích cấp phát thiết bị" />
        </label>
        <label>
          Ghi chú chung
          <textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Thông tin bổ sung nếu có" />
        </label>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div><strong>Chọn thiết bị cấp phát</strong><small>Chỉ hiển thị thiết bị đang trong kho và đủ điều kiện.</small></div>
          <span className="selection-count">Đã chọn {selectedAssets.length}</span>
        </div>
        <div className="asset-selector-search">
          <Search size={18} />
          <input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Tìm theo mã, tên hoặc loại thiết bị..." />
        </div>
        <div className="allocation-assets">
          {filteredAssets.map((asset) => {
            const selected = selectedAssetIds.includes(asset.id);
            return (
              <button className={`allocation-asset-row ${selected ? 'selected' : ''}`} type="button" key={asset.id} onClick={() => toggleAsset(asset.id)}>
                <span className="asset-check">{selected ? '✓' : ''}</span>
                <span><strong>{asset.name}</strong><small>{asset.id} · {asset.category}</small></span>
                <span><strong>{asset.condition}</strong><small>{asset.room}</small></span>
                <span className="pill green">Đủ điều kiện</span>
              </button>
            );
          })}
          {!filteredAssets.length ? <div className="empty-state">Không có thiết bị phù hợp trong kho.</div> : null}
        </div>
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading">
          <span>03</span>
          <div><strong>Danh sách đề nghị</strong><small>Mỗi thiết bị là một dòng duyệt độc lập.</small></div>
        </div>
        <div className="allocation-line-items">
          <div className="allocation-line allocation-line-head"><span>Thiết bị</span><span>Loại</span><span>Trạng thái duyệt</span><span></span></div>
          {selectedAssets.map((asset) => (
            <div className="allocation-line" key={asset.id}>
              <span><strong>{asset.name}</strong><small>{asset.id}</small></span>
              <span>{asset.category}</span>
              <span className="pill amber">Chờ duyệt</span>
              <button type="button" onClick={() => toggleAsset(asset.id)} title="Bỏ thiết bị"><Trash2 size={16} /></button>
            </div>
          ))}
          {!selectedAssets.length ? <div className="empty-state">Chưa có thiết bị nào trong phiếu.</div> : null}
        </div>
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Phiếu và từng dòng sẽ ở trạng thái Chờ duyệt.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length}><FilePlus2 size={18} />Tạo phiếu cấp phát</button>
      </div>
    </form>
  );
}

function AssetSelectionPanel({ assets, selectedAssetIds, onToggle, query, setQuery, emptyMessage }) {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  const filteredAssets = assets.filter((asset) => {
    if (!normalizedQuery) return true;
    return `${asset.id} ${asset.name} ${asset.category} ${asset.room}`.toLocaleLowerCase('vi').includes(normalizedQuery);
  });

  return (
    <>
      <div className="asset-selector-search">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã, tên, loại hoặc vị trí..." />
      </div>
      <div className="allocation-assets">
        {filteredAssets.map((asset) => {
          const selected = selectedAssetIds.includes(asset.id);
          return (
            <button className={`allocation-asset-row ${selected ? 'selected' : ''}`} type="button" key={asset.id} onClick={() => onToggle(asset.id)}>
              <span className="asset-check">{selected ? '✓' : ''}</span>
              <span><strong>{asset.name}</strong><small>{asset.id} · {asset.category}</small></span>
              <span><strong>{asset.condition}</strong><small>{asset.room}</small></span>
              <span className={`pill ${asset.condition === 'Hỏng' || asset.condition === 'Kém' ? 'red' : 'green'}`}>{asset.status}</span>
            </button>
          );
        })}
        {!filteredAssets.length ? <div className="empty-state">{emptyMessage}</div> : null}
      </div>
    </>
  );
}

function SelectedAssetLines({ assets, onRemove, detailLabel = 'Vị trí hiện tại' }) {
  return (
    <div className="allocation-line-items">
      <div className="allocation-line allocation-line-head"><span>Thiết bị</span><span>{detailLabel}</span><span>Trạng thái duyệt</span><span></span></div>
      {assets.map((asset) => (
        <div className="allocation-line" key={asset.id}>
          <span><strong>{asset.name}</strong><small>{asset.id} · {asset.category}</small></span>
          <span><strong>{asset.room}</strong><small>{asset.condition}</small></span>
          <span className="pill amber">Chờ duyệt</span>
          <button type="button" onClick={() => onRemove(asset.id)} title="Bỏ thiết bị"><Trash2 size={16} /></button>
        </div>
      ))}
      {!assets.length ? <div className="empty-state">Chưa có thiết bị nào trong phiếu.</div> : null}
    </div>
  );
}

function RecallReceiptForm({ data, createTicket, onClose }) {
  const recallableAssets = data.assets.filter((asset) => asset.status === 'Đang sử dụng');
  const sourceDepartments = data.departments.filter((department) => recallableAssets.some((asset) => asset.department === department.name));
  const [receipt, setReceipt] = useState({
    departmentId: sourceDepartments[0]?.id || '',
    expectedDate: new Date().toISOString().slice(0, 10),
    expectedReceiver: 'Nhân viên kho CSVC',
    reason: '',
    priority: 'Trung bình',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const selectedDepartment = data.departments.find((item) => item.id === receipt.departmentId);
  const eligibleAssets = recallableAssets.filter((asset) => asset.department === selectedDepartment?.name);
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  };

  const changeDepartment = (departmentId) => {
    setReceipt((current) => ({ ...current, departmentId }));
    setSelectedAssetIds([]);
    setAssetQuery('');
  };

  const submitRecall = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length) return;
    await createTicket(event, {
      type: 'Thu hồi',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: selectedDepartment?.name || 'Phòng ban bị thu hồi',
      department: 'Kho tổng',
      priority: receipt.priority,
      expectedDate: receipt.expectedDate,
      expectedReceiver: receipt.expectedReceiver,
      reason: receipt.reason,
      note: receipt.note,
      recallItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        sourceDepartment: asset.department,
        sourceRoom: asset.room,
        approvalStatus: 'Chờ duyệt',
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitRecall}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu TH - hệ thống tự sinh mã</p><h2>Tạo phiếu thu hồi</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Lập đề nghị thu hồi tài sản từ một phòng ban về kho tổng. Kết quả, người tiếp nhận và thời gian hoàn thành thực tế được ghi nhận sau khi duyệt.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Thông tin thu hồi</strong><small>Mọi thiết bị trong phiếu phải thuộc cùng phòng ban.</small></div></div>
        <div className="form-grid two">
          <label>
            Phòng ban bị thu hồi
            <select value={receipt.departmentId} onChange={(event) => changeDepartment(event.target.value)}>
              {sourceDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label>Nơi tiếp nhận<input value="Kho tổng - Kho CSVC" readOnly /></label>
          <label>Người tiếp nhận dự kiến<input required value={receipt.expectedReceiver} onChange={(event) => setReceipt({ ...receipt, expectedReceiver: event.target.value })} /></label>
          <label>Ngày thu hồi dự kiến<input type="date" required value={receipt.expectedDate} onChange={(event) => setReceipt({ ...receipt, expectedDate: event.target.value })} /></label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option><option>Trung bình</option><option>Cao</option>
            </select>
          </label>
        </div>
        <label>Lý do thu hồi<textarea required rows="3" value={receipt.reason} onChange={(event) => setReceipt({ ...receipt, reason: event.target.value })} placeholder="VD: Điều chỉnh nhu cầu sử dụng, thay mới hoặc điều chuyển về kho" /></label>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Yêu cầu đóng gói, phụ kiện cần bàn giao..." /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị thu hồi</strong><small>Chỉ hiển thị thiết bị đang do phòng ban đã chọn quản lý.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Phòng ban này không có thiết bị đủ điều kiện thu hồi." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Danh sách đề nghị</strong><small>Mỗi thiết bị là một dòng duyệt độc lập.</small></div></div>
        <SelectedAssetLines assets={selectedAssets} onRemove={toggleAsset} />
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Chưa cập nhật vị trí hoặc tồn kho cho đến khi hoàn tất thu hồi.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length}><FilePlus2 size={18} />Tạo phiếu thu hồi</button>
      </div>
    </form>
  );
}

function LiquidationReceiptForm({ data, createTicket, onClose }) {
  const eligibleAssets = data.assets.filter((asset) => asset.status === 'Trong kho' && ['Kém', 'Hỏng', 'Không thể sửa chữa', 'Cũ'].includes(asset.condition));
  const [receipt, setReceipt] = useState({
    reason: '',
    basisCode: '',
    proposedMethod: 'Bán đấu giá',
    expectedDate: new Date().toISOString().slice(0, 10),
    handlingUnit: 'Phòng QLCSVC',
    priority: 'Trung bình',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  };

  const submitLiquidation = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length) return;
    await createTicket(event, {
      type: 'Thanh lý',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: 'Phòng QLCSVC',
      department: receipt.handlingUnit,
      priority: receipt.priority,
      reason: receipt.reason,
      basisCode: receipt.basisCode,
      proposedMethod: receipt.proposedMethod,
      expectedDate: receipt.expectedDate,
      handlingUnit: receipt.handlingUnit,
      note: receipt.note,
      liquidationItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        condition: asset.condition,
        currentRoom: asset.room,
        approvalStatus: 'Chờ duyệt',
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitLiquidation}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu TL - hệ thống tự sinh mã</p><h2>Tạo phiếu thanh lý</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Lập đề nghị thanh lý tài sản xuống cấp đang lưu tại kho. Kết quả và người thực hiện thanh lý chỉ được ghi nhận sau khi từng thiết bị được duyệt.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Thông tin đề xuất</strong><small>Lý do và căn cứ giúp người duyệt đánh giá đề nghị.</small></div></div>
        <div className="form-grid two">
          <label>Căn cứ / mã đề xuất<input required value={receipt.basisCode} onChange={(event) => setReceipt({ ...receipt, basisCode: event.target.value })} placeholder="VD: BB-KK-2026-08" /></label>
          <label>
            Phương thức đề xuất
            <select value={receipt.proposedMethod} onChange={(event) => setReceipt({ ...receipt, proposedMethod: event.target.value })}>
              <option>Bán đấu giá</option><option>Chuyển nhượng</option><option>Tái chế</option><option>Tiêu hủy</option>
            </select>
          </label>
          <label>Ngày xử lý dự kiến<input type="date" required value={receipt.expectedDate} onChange={(event) => setReceipt({ ...receipt, expectedDate: event.target.value })} /></label>
          <label>Đơn vị phụ trách<input required value={receipt.handlingUnit} onChange={(event) => setReceipt({ ...receipt, handlingUnit: event.target.value })} /></label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option><option>Trung bình</option><option>Cao</option>
            </select>
          </label>
        </div>
        <label>Lý do thanh lý<textarea required rows="3" value={receipt.reason} onChange={(event) => setReceipt({ ...receipt, reason: event.target.value })} placeholder="Mô tả tình trạng, nguyên nhân và sự cần thiết phải thanh lý" /></label>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Thông tin bổ sung hoặc yêu cầu xử lý" /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị thanh lý</strong><small>Chỉ hiển thị tài sản xuống cấp đã được đưa về kho.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không có thiết bị đủ điều kiện đề xuất thanh lý." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Danh sách đề nghị</strong><small>Mỗi thiết bị được duyệt độc lập và vẫn giữ nguyên trạng thái hiện tại.</small></div></div>
        <SelectedAssetLines assets={selectedAssets} onRemove={toggleAsset} detailLabel="Vị trí / tình trạng" />
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Chưa ghi giảm tài sản cho đến khi hoàn tất thanh lý.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length}><FilePlus2 size={18} />Tạo phiếu thanh lý</button>
      </div>
    </form>
  );
}

function Warehouse({ data, form, setForm, createTicket }) {
  const [activeAction, setActiveAction] = useState(null);
  const submitTicket = async (event) => {
    await createTicket(event);
    setActiveAction(null);
  };

  const openAction = (action) => {
    setForm({
      ...form,
      type: action.type,
      asset: '',
      requester: action.requester,
      department: action.department,
      priority: 'Trung bình',
    });
    setActiveAction(action);
  };

  return (
    <section className={`screen split ${['import', 'allocate', 'recall', 'liquidate'].includes(activeAction?.key) ? 'import-layout' : 'wide'}`}>
      {activeAction ? (
        activeAction.key === 'import' ? (
          <ImportReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : activeAction.key === 'allocate' ? (
          <AllocationReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : activeAction.key === 'recall' ? (
          <RecallReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : activeAction.key === 'liquidate' ? (
          <LiquidationReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : (
          <RequestForm
          title={activeAction.title}
          form={form}
          setForm={setForm}
          createTicket={submitTicket}
          onClose={() => setActiveAction(null)}
          fixedType={activeAction.type}
          assetLabel={activeAction.assetLabel}
          requesterLabel={activeAction.requesterLabel}
          departmentLabel={activeAction.departmentLabel}
          helper={activeAction.helper}
          submitLabel="Tạo phiếu"
        />
        )
      ) : (
        <ActionPicker title="Nghiệp vụ kho" actions={warehouseActions} onCreate={openAction} />
      )}
      <div className="warehouse-side">
        <StockQuantity data={data} />
        <AssetTable assets={data.assets} />
      </div>
    </section>
  );
}

function StockQuantity({ data }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(data.stockQuantities[0]?.categoryId || '');
  const selectedStock = data.stockQuantities.find((item) => item.categoryId === selectedCategoryId) || data.stockQuantities[0];
  const transactions = data.stockTransactions
    .filter((item) => item.categoryId === selectedStock?.categoryId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!selectedStock) {
    return null;
  }

  return (
    <div className="panel stock-panel">
      <div className="panel-head">
        <h2>Stock quantity</h2>
        <span className="role-chip">{data.stockQuantities.length} loại</span>
      </div>
      <div className="stock-list">
        {data.stockQuantities.map((stock) => (
          <button
            className={`stock-card ${stock.categoryId === selectedStock.categoryId ? 'active' : ''}`}
            key={stock.categoryId}
            type="button"
            onClick={() => setSelectedCategoryId(stock.categoryId)}
          >
            <span>
              <strong>{stock.categoryName}</strong>
              <small>Cập nhật: {stock.updatedAt}</small>
            </span>
            <b>{stock.quantity}</b>
          </button>
        ))}
      </div>
      <div className="stock-transactions">
        <div className="panel-head compact-head">
          <h2>Stock transaction</h2>
          <span className="role-chip">{selectedStock.categoryName}</span>
        </div>
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div className="transaction-row" key={transaction.id}>
              <span>{transaction.categoryName}</span>
              <strong className={transaction.change > 0 ? 'stock-plus' : 'stock-minus'}>{transaction.change > 0 ? `+${transaction.change}` : transaction.change}</strong>
              <span>{transaction.source}</span>
              <time>{transaction.date}</time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionPicker({ title, actions, onCreate }) {
  return (
    <div className="panel create-card">
      <h2>{title}</h2>
      <div className="action-list">
        {actions.map((action) => (
          <button className="action-button" type="button" key={action.key} onClick={() => onCreate(action)}>
            <FilePlus2 size={18} />
            <span>
              <strong>{action.menuLabel || action.actionLabel}</strong>
              <small>{action.helper}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BorrowReceiptForm({ data, createTicket, onClose }) {
  const eligiblePool = data.assets.filter((asset) => ['Trong kho', 'Đang sử dụng'].includes(asset.status) && !['Hỏng', 'Kém'].includes(asset.condition));
  const sourceNames = [...new Set(eligiblePool.map((asset) => asset.department))];
  const [receipt, setReceipt] = useState({
    sourceDepartment: sourceNames[0] || '',
    borrowerName: '',
    borrowerDepartmentId: data.departments[2]?.id || data.departments[0]?.id || '',
    borrowerPhone: '',
    borrowDate: new Date().toISOString().slice(0, 10),
    expectedReturnDate: '',
    useLocation: '',
    purpose: '',
    priority: 'Trung bình',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const eligibleAssets = eligiblePool.filter((asset) => asset.department === receipt.sourceDepartment);
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);
  const borrowerDepartment = data.departments.find((item) => item.id === receipt.borrowerDepartmentId);

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  };

  const changeSource = (sourceDepartment) => {
    setReceipt((current) => ({ ...current, sourceDepartment }));
    setSelectedAssetIds([]);
    setAssetQuery('');
  };

  const submitBorrow = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length) return;
    await createTicket(event, {
      type: 'Mượn / Trả',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: `${receipt.borrowerName} - ${borrowerDepartment?.name || ''}`,
      department: receipt.sourceDepartment,
      priority: receipt.priority,
      borrowerName: receipt.borrowerName,
      borrowerDepartmentId: receipt.borrowerDepartmentId,
      borrowerPhone: receipt.borrowerPhone,
      borrowDate: receipt.borrowDate,
      expectedReturnDate: receipt.expectedReturnDate,
      useLocation: receipt.useLocation,
      purpose: receipt.purpose,
      note: receipt.note,
      borrowItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        managingDepartment: asset.department,
        approvalStatus: 'Chờ duyệt',
        borrowStatus: null,
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitBorrow}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu MT - hệ thống tự sinh mã</p><h2>Tạo phiếu mượn thiết bị</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Phiếu ghi nhận nhu cầu mượn. Trạng thái Đang mượn chỉ được khởi tạo sau khi thiết bị được duyệt; việc trả thiết bị được ghi nhận ở bước riêng.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Thông tin người mượn</strong><small>Người trực tiếp chịu trách nhiệm đối với thiết bị.</small></div></div>
        <div className="form-grid two">
          <label>Họ tên người mượn<input required value={receipt.borrowerName} onChange={(event) => setReceipt({ ...receipt, borrowerName: event.target.value })} placeholder="Nhập họ tên người chịu trách nhiệm" /></label>
          <label>
            Phòng ban người mượn
            <select value={receipt.borrowerDepartmentId} onChange={(event) => setReceipt({ ...receipt, borrowerDepartmentId: event.target.value })}>
              {data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label>Số điện thoại liên hệ<input required value={receipt.borrowerPhone} onChange={(event) => setReceipt({ ...receipt, borrowerPhone: event.target.value })} placeholder="VD: 0903 123 456" /></label>
          <label>Địa điểm sử dụng<input required value={receipt.useLocation} onChange={(event) => setReceipt({ ...receipt, useLocation: event.target.value })} placeholder="VD: Hội trường A" /></label>
          <label>Ngày mượn<input type="date" required value={receipt.borrowDate} onChange={(event) => setReceipt({ ...receipt, borrowDate: event.target.value })} /></label>
          <label>Ngày trả dự kiến<input type="date" required min={receipt.borrowDate} value={receipt.expectedReturnDate} onChange={(event) => setReceipt({ ...receipt, expectedReturnDate: event.target.value })} /></label>
          <label>
            Đơn vị quản lý thiết bị
            <select value={receipt.sourceDepartment} onChange={(event) => changeSource(event.target.value)}>
              {sourceNames.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option><option>Trung bình</option><option>Cao</option>
            </select>
          </label>
        </div>
        <label>Mục đích mượn<textarea required rows="3" value={receipt.purpose} onChange={(event) => setReceipt({ ...receipt, purpose: event.target.value })} placeholder="Mô tả công việc hoặc sự kiện cần sử dụng thiết bị" /></label>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Phụ kiện đi kèm hoặc yêu cầu bàn giao" /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị mượn</strong><small>Không hiển thị thiết bị đang cho mượn, báo hỏng hoặc xuống cấp.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Đơn vị này không có thiết bị phù hợp để cho mượn." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Danh sách đề nghị</strong><small>Mỗi thiết bị được duyệt độc lập.</small></div></div>
        <SelectedAssetLines assets={selectedAssets} onRemove={toggleAsset} />
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Trạng thái mượn/trả chưa được khởi tạo ở bước này.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length}><FilePlus2 size={18} />Tạo phiếu mượn</button>
      </div>
    </form>
  );
}

function TransferReceiptForm({ data, createTicket, onClose }) {
  const transferableAssets = data.assets.filter((asset) => asset.status === 'Đang sử dụng' && asset.condition !== 'Hỏng');
  const sourceDepartments = data.departments.filter((department) => transferableAssets.some((asset) => asset.department === department.name));
  const initialSource = sourceDepartments[0];
  const initialTarget = data.departments.find((department) => department.id !== initialSource?.id);
  const rooms = useMemo(() => flattenRooms(data.locations), [data.locations]);
  const initialTargetRoom = rooms.find((room) => room.department === initialTarget?.name && !room.locked);
  const [receipt, setReceipt] = useState({
    sourceDepartmentId: initialSource?.id || '',
    targetDepartmentId: initialTarget?.id || '',
    targetRoomId: initialTargetRoom?.id || '',
    sourceContact: initialSource?.manager || '',
    targetContact: initialTarget?.manager || '',
    expectedDate: new Date().toISOString().slice(0, 10),
    reason: '',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const sourceDepartment = data.departments.find((item) => item.id === receipt.sourceDepartmentId);
  const targetDepartment = data.departments.find((item) => item.id === receipt.targetDepartmentId);
  const targetRooms = rooms.filter((room) => room.department === targetDepartment?.name && !room.locked);
  const eligibleAssets = transferableAssets.filter((asset) => asset.department === sourceDepartment?.name);
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  };

  const changeSource = (sourceDepartmentId) => {
    const department = data.departments.find((item) => item.id === sourceDepartmentId);
    setReceipt((current) => ({ ...current, sourceDepartmentId, sourceContact: department?.manager || '' }));
    setSelectedAssetIds([]);
    setAssetQuery('');
  };

  const changeTarget = (targetDepartmentId) => {
    const department = data.departments.find((item) => item.id === targetDepartmentId);
    const firstRoom = rooms.find((room) => room.department === department?.name && !room.locked);
    setReceipt((current) => ({ ...current, targetDepartmentId, targetRoomId: firstRoom?.id || '', targetContact: department?.manager || '' }));
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length || receipt.sourceDepartmentId === receipt.targetDepartmentId) return;
    const targetRoom = rooms.find((room) => room.id === receipt.targetRoomId);
    await createTicket(event, {
      type: 'Điều chuyển',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: sourceDepartment?.name || 'Phòng ban ban đầu',
      department: targetDepartment?.name || 'Phòng ban nhận',
      priority: 'Trung bình',
      sourceDepartmentId: receipt.sourceDepartmentId,
      targetDepartmentId: receipt.targetDepartmentId,
      targetRoomId: receipt.targetRoomId,
      targetRoomName: targetRoom?.name || '',
      sourceContact: receipt.sourceContact,
      targetContact: receipt.targetContact,
      expectedDate: receipt.expectedDate,
      reason: receipt.reason,
      note: receipt.note,
      transferItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        sourceRoom: asset.room,
        approvalStatus: 'Chờ duyệt',
      })),
    });
    onClose();
  };

  const sameDepartment = receipt.sourceDepartmentId === receipt.targetDepartmentId;
  return (
    <form className="panel request-form allocation-form" onSubmit={submitTransfer}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu ĐC - hệ thống tự sinh mã</p><h2>Tạo phiếu điều chuyển</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Dùng sau khi hai phòng ban đã thống nhất ngoài hệ thống. Trách nhiệm quản lý và vị trí thiết bị chỉ thay đổi khi điều chuyển được duyệt và hoàn tất.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Hướng điều chuyển</strong><small>Một phiếu chỉ áp dụng cho một cặp phòng ban nguồn và nhận.</small></div></div>
        <div className="form-grid two">
          <label>
            Phòng ban ban đầu
            <select value={receipt.sourceDepartmentId} onChange={(event) => changeSource(event.target.value)}>
              {sourceDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label>
            Phòng ban nhận
            <select value={receipt.targetDepartmentId} onChange={(event) => changeTarget(event.target.value)}>
              {data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            {sameDepartment ? <small className="field-error">Phòng ban nhận phải khác phòng ban ban đầu.</small> : null}
          </label>
          <label>
            Phòng / vị trí nhận
            <select value={receipt.targetRoomId} onChange={(event) => setReceipt({ ...receipt, targetRoomId: event.target.value })}>
              <option value="">Chưa xác định phòng</option>
              {targetRooms.map((room) => <option key={room.id} value={room.id}>{room.name} - {room.buildingName}, {room.floorName}</option>)}
            </select>
          </label>
          <label>Ngày điều chuyển dự kiến<input type="date" required value={receipt.expectedDate} onChange={(event) => setReceipt({ ...receipt, expectedDate: event.target.value })} /></label>
          <label>Người liên hệ bên giao<input required value={receipt.sourceContact} onChange={(event) => setReceipt({ ...receipt, sourceContact: event.target.value })} /></label>
          <label>Người liên hệ bên nhận<input required value={receipt.targetContact} onChange={(event) => setReceipt({ ...receipt, targetContact: event.target.value })} /></label>
        </div>
        <label>Lý do điều chuyển<textarea required rows="3" value={receipt.reason} onChange={(event) => setReceipt({ ...receipt, reason: event.target.value })} placeholder="Mô tả nhu cầu và nội dung hai bên đã thống nhất" /></label>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Điều kiện bàn giao, phụ kiện hoặc lưu ý vận chuyển" /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị điều chuyển</strong><small>Chỉ hiển thị thiết bị do phòng ban ban đầu quản lý.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không có thiết bị phù hợp để điều chuyển." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Danh sách đề nghị</strong><small>Mỗi thiết bị là một dòng duyệt độc lập.</small></div></div>
        <SelectedAssetLines assets={selectedAssets} onRemove={toggleAsset} />
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Chưa thay đổi đơn vị quản lý ở bước tạo phiếu.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length || sameDepartment}><FilePlus2 size={18} />Tạo phiếu điều chuyển</button>
      </div>
    </form>
  );
}

function DamageReportForm({ data, createTicket, onClose }) {
  const reportableAssets = data.assets.filter((asset) => asset.status !== 'Báo hỏng' && asset.condition !== 'Hỏng');
  const [assetQuery, setAssetQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [report, setReport] = useState({
    occurredAt: new Date().toISOString().slice(0, 16),
    severity: 'Trung bình',
    impact: 'Thiết bị hoạt động không ổn định',
    description: '',
    immediateAction: '',
    note: '',
  });
  const selectedAsset = reportableAssets.find((asset) => asset.id === selectedAssetId);

  const submitDamageReport = async (event) => {
    event.preventDefault();
    if (!selectedAsset) return;
    await createTicket(event, {
      type: 'Báo hỏng / Sửa chữa',
      asset: `${selectedAsset.id} - ${selectedAsset.name}`,
      requester: selectedAsset.department,
      department: 'Phòng QLCSVC',
      priority: report.severity === 'Nghiêm trọng' ? 'Cao' : 'Trung bình',
      reporter: 'Tài khoản đang đăng nhập',
      occurredAt: report.occurredAt,
      severity: report.severity,
      impact: report.impact,
      description: report.description,
      immediateAction: report.immediateAction,
      note: report.note,
      assetLocation: selectedAsset.room,
      assetDepartment: selectedAsset.department,
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitDamageReport}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu BH - hệ thống tự sinh mã</p><h2>Tạo phiếu báo hỏng</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Phiếu báo hỏng ghi nhận hiện tượng của một thiết bị. Việc tạo phiếu này chưa đồng nghĩa với việc đã tạo phiếu sửa chữa.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Chọn thiết bị</strong><small>Người báo, đơn vị và thời điểm tạo phiếu được hệ thống ghi nhận.</small></div></div>
        <AssetSelectionPanel assets={reportableAssets} selectedAssetIds={selectedAssetId ? [selectedAssetId] : []} onToggle={(assetId) => setSelectedAssetId((current) => current === assetId ? '' : assetId)} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không tìm thấy thiết bị thuộc phạm vi được phép báo hỏng." />
        {selectedAsset ? (
          <div className="selected-asset-summary">
            <div><small>Thiết bị</small><strong>{selectedAsset.id} - {selectedAsset.name}</strong></div>
            <div><small>Đơn vị sử dụng</small><strong>{selectedAsset.department}</strong></div>
            <div><small>Vị trí hiện tại</small><strong>{selectedAsset.room}</strong></div>
            <div><small>Tình trạng hiện tại</small><strong>{selectedAsset.condition}</strong></div>
          </div>
        ) : null}
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Mô tả sự cố</strong><small>Cung cấp đủ thông tin để bộ phận CSVC phân loại xử lý.</small></div></div>
        <div className="form-grid two">
          <label>Thời điểm phát hiện<input type="datetime-local" required value={report.occurredAt} onChange={(event) => setReport({ ...report, occurredAt: event.target.value })} /></label>
          <label>
            Mức độ
            <select value={report.severity} onChange={(event) => setReport({ ...report, severity: event.target.value })}>
              <option>Nhẹ</option><option>Trung bình</option><option>Nghiêm trọng</option>
            </select>
          </label>
          <label>
            Ảnh hưởng vận hành
            <select value={report.impact} onChange={(event) => setReport({ ...report, impact: event.target.value })}>
              <option>Thiết bị hoạt động không ổn định</option><option>Thiết bị ngừng hoạt động</option><option>Ảnh hưởng một phần công việc</option><option>Ảnh hưởng an toàn</option>
            </select>
          </label>
        </div>
        <label>Mô tả tình trạng hỏng<textarea required rows="4" value={report.description} onChange={(event) => setReport({ ...report, description: event.target.value })} placeholder="Hiện tượng, thông báo lỗi, âm thanh hoặc dấu hiệu bất thường..." /></label>
        <label>Xử lý tạm thời đã thực hiện<textarea rows="2" value={report.immediateAction} onChange={(event) => setReport({ ...report, immediateAction: event.target.value })} placeholder="VD: Ngắt nguồn, dừng sử dụng và đặt biển cảnh báo" /></label>
        <label>Ghi chú<textarea rows="2" value={report.note} onChange={(event) => setReport({ ...report, note: event.target.value })} placeholder="Thông tin bổ sung nếu có" /></label>
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAsset ? selectedAsset.id : 'Chưa chọn thiết bị'}</strong><small>Phiếu sau khi tạo sẽ chuyển đến bộ phận CSVC xử lý.</small></div>
        <button className="primary" type="submit" disabled={!selectedAsset}><FilePlus2 size={18} />Gửi báo hỏng</button>
      </div>
    </form>
  );
}

function Usage({ data, form, setForm, createTicket }) {
  const [activeAction, setActiveAction] = useState(null);
  const submitTicket = async (event) => {
    await createTicket(event);
    setActiveAction(null);
  };

  const openAction = (action) => {
    setForm({
      ...form,
      type: action.type,
      asset: '',
      requester: action.requester,
      department: action.department,
      priority: 'Trung bình',
    });
    setActiveAction(action);
  };

  return (
    <section className={`screen split ${activeAction ? 'import-layout' : 'wide'}`}>
      {activeAction ? (
        activeAction.key === 'borrow-return' ? (
          <BorrowReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : activeAction.key === 'transfer' ? (
          <TransferReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : (
          <DamageReportForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        )
      ) : (
        <ActionPicker title="Nghiệp vụ sử dụng" actions={usageActions} onCreate={openAction} />
      )}
      <AssetTable assets={data.assets.filter((asset) => asset.status !== 'Trong kho')} />
    </section>
  );
}

function MaintenanceReceiptForm({ data, createTicket, onClose }) {
  const eligibleAssets = data.assets.filter((asset) => !['Cho mượn', 'Báo hỏng'].includes(asset.status) && !['Hỏng', 'Kém'].includes(asset.condition));
  const [receipt, setReceipt] = useState({
    maintenanceType: 'Định kỳ',
    planCode: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    executionLocation: 'Tại vị trí thiết bị',
    serviceUnit: 'Đội kỹ thuật CSVC',
    scope: '',
    priority: 'Trung bình',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);
  const toggleAsset = (assetId) => setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);

  const submitMaintenance = async (event) => {
    event.preventDefault();
    if (!selectedAssets.length) return;
    await createTicket(event, {
      type: 'Bảo trì',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: 'Nhân viên phòng QL thiết bị',
      department: receipt.serviceUnit,
      priority: receipt.priority,
      maintenanceType: receipt.maintenanceType,
      planCode: receipt.planCode,
      scheduledDate: receipt.scheduledDate,
      executionLocation: receipt.executionLocation,
      serviceUnit: receipt.serviceUnit,
      scope: receipt.scope,
      note: receipt.note,
      maintenanceItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        nextMaintenance: asset.nextMaintenance,
        approvalStatus: 'Chờ duyệt',
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitMaintenance}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu BT - hệ thống tự sinh mã</p><h2>Tạo phiếu bảo trì</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Lập kế hoạch bảo trì định kỳ hoặc đột xuất. Kết quả và thời gian hoàn thành thực tế chỉ được ghi nhận sau khi từng thiết bị được duyệt.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Thông tin công việc</strong><small>Xác định kế hoạch, thời gian và phạm vi bảo trì.</small></div></div>
        <div className="form-grid two">
          <label>
            Hình thức bảo trì
            <select value={receipt.maintenanceType} onChange={(event) => setReceipt({ ...receipt, maintenanceType: event.target.value })}>
              <option>Định kỳ</option><option>Đột xuất</option>
            </select>
          </label>
          <label>Mã kế hoạch<input value={receipt.planCode} onChange={(event) => setReceipt({ ...receipt, planCode: event.target.value })} placeholder="VD: KH-BT-Q4-2026" /></label>
          <label>Ngày thực hiện dự kiến<input type="date" required value={receipt.scheduledDate} onChange={(event) => setReceipt({ ...receipt, scheduledDate: event.target.value })} /></label>
          <label>
            Địa điểm thực hiện
            <select value={receipt.executionLocation} onChange={(event) => setReceipt({ ...receipt, executionLocation: event.target.value })}>
              <option>Tại vị trí thiết bị</option><option>Tại kho CSVC</option><option>Tại đơn vị dịch vụ</option>
            </select>
          </label>
          <label>Đơn vị / nhóm thực hiện<input required value={receipt.serviceUnit} onChange={(event) => setReceipt({ ...receipt, serviceUnit: event.target.value })} /></label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option><option>Trung bình</option><option>Cao</option>
            </select>
          </label>
        </div>
        <label>Nội dung / phạm vi bảo trì<textarea required rows="3" value={receipt.scope} onChange={(event) => setReceipt({ ...receipt, scope: event.target.value })} placeholder="VD: Vệ sinh, kiểm tra nguồn, hiệu chuẩn và cập nhật phần mềm" /></label>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Yêu cầu chuẩn bị hoặc thời gian gián đoạn dự kiến" /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị bảo trì</strong><small>Loại trừ thiết bị đang mượn, báo hỏng hoặc xuống cấp.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không có thiết bị phù hợp để bảo trì." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Danh sách bảo trì</strong><small>Mỗi thiết bị là một dòng duyệt độc lập.</small></div></div>
        <SelectedAssetLines assets={selectedAssets} onRemove={toggleAsset} detailLabel="Vị trí / tình trạng" />
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>Chưa cập nhật kết quả bảo trì ở bước tạo phiếu.</small></div>
        <button className="primary" type="submit" disabled={!selectedAssets.length}><FilePlus2 size={18} />Tạo phiếu bảo trì</button>
      </div>
    </form>
  );
}

function RepairReceiptForm({ data, createTicket, onClose }) {
  const eligibleAssets = data.assets.filter((asset) => asset.status === 'Báo hỏng' || (asset.condition === 'Cần kiểm tra' && asset.status !== 'Cho mượn'));
  const [receipt, setReceipt] = useState({
    repairMode: 'Nội bộ',
    serviceUnit: 'Đội kỹ thuật CSVC',
    expectedStartDate: new Date().toISOString().slice(0, 10),
    expectedFinishDate: '',
    priority: 'Cao',
    note: '',
  });
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [assetQuery, setAssetQuery] = useState('');
  const selectedAssets = selectedAssetIds.map((id) => eligibleAssets.find((asset) => asset.id === id)).filter(Boolean);
  const requirementsComplete = selectedAssets.length > 0 && selectedAssets.every((asset) => requirements[asset.id]?.trim());

  const toggleAsset = (assetId) => {
    setSelectedAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
    setRequirements((current) => ({ ...current, [assetId]: current[assetId] || '' }));
  };

  const submitRepair = async (event) => {
    event.preventDefault();
    if (!requirementsComplete) return;
    await createTicket(event, {
      type: 'Sửa chữa',
      asset: selectedAssets.map((asset) => `${asset.id} - ${asset.name}`).join(', '),
      requester: 'Phòng QLCSVC',
      department: receipt.serviceUnit,
      priority: receipt.priority,
      repairMode: receipt.repairMode,
      serviceUnit: receipt.serviceUnit,
      expectedStartDate: receipt.expectedStartDate,
      expectedFinishDate: receipt.expectedFinishDate,
      note: receipt.note,
      repairItems: selectedAssets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        damageReportId: asset.damageReportId || null,
        requirement: requirements[asset.id],
        approvalStatus: 'Chờ duyệt',
        repairStatus: null,
      })),
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitRepair}>
      <div className="panel-head">
        <div><p className="section-kicker">Phiếu SC - hệ thống tự sinh mã</p><h2>Tạo phiếu sửa chữa</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Mỗi thiết bị phải có nội dung sửa chữa riêng. Trạng thái Đang sửa chỉ được khởi tạo sau khi item được duyệt.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Thông tin thực hiện</strong><small>Xác định phương án và đơn vị dự kiến sửa chữa.</small></div></div>
        <div className="form-grid two">
          <label>
            Hình thức sửa chữa
            <select value={receipt.repairMode} onChange={(event) => setReceipt({ ...receipt, repairMode: event.target.value })}>
              <option>Nội bộ</option><option>Thuê đơn vị ngoài</option>
            </select>
          </label>
          <label>Đơn vị sửa chữa dự kiến<input required value={receipt.serviceUnit} onChange={(event) => setReceipt({ ...receipt, serviceUnit: event.target.value })} /></label>
          <label>Ngày bắt đầu dự kiến<input type="date" required value={receipt.expectedStartDate} onChange={(event) => setReceipt({ ...receipt, expectedStartDate: event.target.value })} /></label>
          <label>Ngày hoàn thành dự kiến<input type="date" min={receipt.expectedStartDate} value={receipt.expectedFinishDate} onChange={(event) => setReceipt({ ...receipt, expectedFinishDate: event.target.value })} /></label>
          <label>
            Mức ưu tiên
            <select value={receipt.priority} onChange={(event) => setReceipt({ ...receipt, priority: event.target.value })}>
              <option>Thấp</option><option>Trung bình</option><option>Cao</option>
            </select>
          </label>
        </div>
        <label>Ghi chú chung<textarea rows="2" value={receipt.note} onChange={(event) => setReceipt({ ...receipt, note: event.target.value })} placeholder="Ngân sách dự kiến, yêu cầu linh kiện hoặc lưu ý an toàn" /></label>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Chọn thiết bị sửa chữa</strong><small>Ưu tiên thiết bị đã có báo hỏng hoặc cần kiểm tra.</small></div><span className="selection-count">Đã chọn {selectedAssets.length}</span></div>
        <AssetSelectionPanel assets={eligibleAssets} selectedAssetIds={selectedAssetIds} onToggle={toggleAsset} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không có thiết bị đủ điều kiện lập phiếu sửa chữa." />
      </section>

      <section className="form-section allocation-summary">
        <div className="form-section-heading"><span>03</span><div><strong>Yêu cầu theo thiết bị</strong><small>Nội dung sửa chữa là bắt buộc cho từng dòng.</small></div></div>
        <div className="repair-items">
          {selectedAssets.map((asset) => (
            <div className="repair-item" key={asset.id}>
              <div className="repair-item-head">
                <span><strong>{asset.name}</strong><small>{asset.id} · {asset.damageReportId ? `Báo hỏng ${asset.damageReportId}` : 'Chưa liên kết báo hỏng'}</small></span>
                <span className="pill amber">Chờ duyệt</span>
                <button type="button" onClick={() => toggleAsset(asset.id)} title="Bỏ thiết bị"><Trash2 size={16} /></button>
              </div>
              <label>Nội dung / yêu cầu sửa chữa<textarea required rows="2" value={requirements[asset.id] || ''} onChange={(event) => setRequirements({ ...requirements, [asset.id]: event.target.value })} placeholder="Mô tả lỗi và hạng mục cần kiểm tra, thay thế hoặc sửa chữa" /></label>
            </div>
          ))}
          {!selectedAssets.length ? <div className="empty-state">Chưa có thiết bị nào trong phiếu.</div> : null}
        </div>
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAssets.length} thiết bị</strong><small>{requirementsComplete ? 'Đã nhập đủ yêu cầu sửa chữa.' : 'Cần nhập yêu cầu cho từng thiết bị.'}</small></div>
        <button className="primary" type="submit" disabled={!requirementsComplete}><FilePlus2 size={18} />Tạo phiếu sửa chữa</button>
      </div>
    </form>
  );
}

function WarrantyRequestForm({ data, createTicket, onClose }) {
  const warrantyCandidates = data.assets.filter((asset) => asset.status === 'Báo hỏng' && asset.warrantyExpiry);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [request, setRequest] = useState({
    expectedHandoverDate: new Date().toISOString().slice(0, 10),
    faultDescription: '',
    requestContent: '',
    accessories: '',
    contactPerson: 'Nhân viên phòng QL thiết bị',
    note: '',
  });
  const selectedAsset = warrantyCandidates.find((asset) => asset.id === selectedAssetId);
  const warrantyValid = Boolean(selectedAsset && selectedAsset.warrantyExpiry >= new Date().toISOString().slice(0, 10));

  const submitWarranty = async (event) => {
    event.preventDefault();
    if (!warrantyValid) return;
    await createTicket(event, {
      type: 'Bảo hành',
      asset: `${selectedAsset.id} - ${selectedAsset.name}`,
      requester: 'Phòng QLCSVC',
      department: selectedAsset.supplier,
      priority: 'Cao',
      expectedHandoverDate: request.expectedHandoverDate,
      faultDescription: request.faultDescription,
      requestContent: request.requestContent,
      accessories: request.accessories,
      contactPerson: request.contactPerson,
      note: request.note,
      warrantyExpiry: selectedAsset.warrantyExpiry,
      supplier: selectedAsset.supplier,
      importReceiptId: selectedAsset.importReceiptId,
      damageReportId: selectedAsset.damageReportId || null,
    });
    onClose();
  };

  return (
    <form className="panel request-form allocation-form" onSubmit={submitWarranty}>
      <div className="panel-head">
        <div><p className="section-kicker">Yêu cầu BH - hệ thống tự sinh mã</p><h2>Tạo yêu cầu bảo hành</h2></div>
        <button className="ghost-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p className="form-helper">Hệ thống kiểm tra thiết bị, phiếu nhập, nhà cung cấp và hạn bảo hành trước khi cho phép tạo yêu cầu.</p>

      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><strong>Chọn thiết bị bảo hành</strong><small>Chỉ hiển thị thiết bị báo hỏng có thông tin bảo hành.</small></div></div>
        <AssetSelectionPanel assets={warrantyCandidates} selectedAssetIds={selectedAssetId ? [selectedAssetId] : []} onToggle={(assetId) => setSelectedAssetId((current) => current === assetId ? '' : assetId)} query={assetQuery} setQuery={setAssetQuery} emptyMessage="Không có thiết bị có thông tin bảo hành." />
        {selectedAsset ? (
          <div className={`warranty-check ${warrantyValid ? 'valid' : 'invalid'}`}>
            <div><small>Phiếu nhập liên quan</small><strong>{selectedAsset.importReceiptId}</strong></div>
            <div><small>Nhà cung cấp</small><strong>{selectedAsset.supplier}</strong></div>
            <div><small>Hạn bảo hành</small><strong>{selectedAsset.warrantyExpiry}</strong></div>
            <div><small>Kết quả kiểm tra</small><strong>{warrantyValid ? 'Còn thời hạn bảo hành' : 'Đã hết thời hạn bảo hành'}</strong></div>
          </div>
        ) : null}
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><strong>Nội dung yêu cầu</strong><small>Thông tin dùng để bàn giao thiết bị cho nhà cung cấp.</small></div></div>
        <div className="form-grid two">
          <label>Ngày bàn giao dự kiến<input type="date" required value={request.expectedHandoverDate} onChange={(event) => setRequest({ ...request, expectedHandoverDate: event.target.value })} /></label>
          <label>Người liên hệ bàn giao<input required value={request.contactPerson} onChange={(event) => setRequest({ ...request, contactPerson: event.target.value })} /></label>
          <label>Phụ kiện bàn giao kèm<input value={request.accessories} onChange={(event) => setRequest({ ...request, accessories: event.target.value })} placeholder="VD: Adapter nguồn, dây tín hiệu" /></label>
        </div>
        <label>Mô tả lỗi / tình trạng<textarea required rows="3" value={request.faultDescription} onChange={(event) => setRequest({ ...request, faultDescription: event.target.value })} placeholder="Mô tả hiện tượng và tình trạng hiện tại của thiết bị" /></label>
        <label>Nội dung yêu cầu bảo hành<textarea required rows="3" value={request.requestContent} onChange={(event) => setRequest({ ...request, requestContent: event.target.value })} placeholder="Yêu cầu kiểm tra, sửa chữa hoặc thay thế theo chính sách bảo hành" /></label>
        <label>Ghi chú<textarea rows="2" value={request.note} onChange={(event) => setRequest({ ...request, note: event.target.value })} placeholder="Tình trạng niêm phong hoặc lưu ý khi vận chuyển" /></label>
      </section>

      <div className="form-submit-bar">
        <div><strong>{selectedAsset ? selectedAsset.id : 'Chưa chọn thiết bị'}</strong><small>{selectedAsset ? (warrantyValid ? 'Đủ điều kiện tạo yêu cầu.' : 'Thiết bị đã hết hạn bảo hành.') : 'Chọn thiết bị để kiểm tra điều kiện.'}</small></div>
        <button className="primary" type="submit" disabled={!warrantyValid}><FilePlus2 size={18} />Tạo yêu cầu bảo hành</button>
      </div>
    </form>
  );
}

function Maintenance({ form, setForm, createTicket, data }) {
  const [activeAction, setActiveAction] = useState(null);
  const submitTicket = async (event) => {
    await createTicket(event);
    setActiveAction(null);
  };

  const openAction = (action) => {
    setForm({
      ...form,
      type: action.type,
      asset: '',
      requester: action.requester,
      department: action.department,
      priority: 'Trung bình',
    });
    setActiveAction(action);
  };

  return (
    <section className={`screen split ${activeAction ? 'import-layout' : 'wide'}`}>
      {activeAction ? (
        activeAction.key === 'maintenance' ? (
          <MaintenanceReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : activeAction.key === 'repair' ? (
          <RepairReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        ) : (
          <WarrantyRequestForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
        )
      ) : (
        <ActionPicker title="Nghiệp vụ tình trạng" actions={maintenanceActions} onCreate={openAction} />
      )}
      <div className="panel">
        <h2>Lịch bảo trì gần nhất</h2>
        {['TB-00078: kiểm tra Wi-Fi tại C1.101', 'TB-00057: vệ sinh và test pin', 'TB-00041: bảo trì máy chiếu định kỳ'].map((item) => (
          <div className="queue-item" key={item}>
            <Settings size={18} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CreateTicketCard({ title, actionLabel, onCreate }) {
  return (
    <div className="panel create-card">
      <h2>{title}</h2>
      <button className="primary" type="button" onClick={onCreate}><FilePlus2 size={18} />{actionLabel}</button>
      <div className="rules">
        <strong>Trạng thái mặc định</strong>
        <p>Phiếu mới tạo ở trạng thái Chờ duyệt, gồm thông tin chung và các thiết bị cần xử lý theo từng dòng chi tiết.</p>
      </div>
    </div>
  );
}

function Approval({ data, role, approveTicket }) {
  const canApprove = role === roles[0];
  return (
    <section className="screen">
      <div className="panel">
        <div className="panel-head">
          <h2>Hàng đợi nghiệp vụ</h2>
          <span className="role-chip">{canApprove ? 'Có quyền duyệt' : 'Chỉ xem / xử lý nghiệp vụ'}</span>
        </div>
        <TicketTable tickets={data.tickets} onApprove={canApprove ? approveTicket : null} />
      </div>
    </section>
  );
}

function AssetHistory({ data, query, setQuery, filteredAssets }) {
  return (
    <section className="screen split history-layout">
      <div className="panel">
        <div className="searchbox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã, tên, phòng ban, phòng..." />
        </div>
        <AssetTable assets={filteredAssets} />
      </div>
      <div className="panel timeline">
        <h2>Lịch sử TB-00041</h2>
        {data.history.map((event) => (
          <div className="timeline-row" key={`${event.time}-${event.title}`}>
            <time>{event.time}</time>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Diagrams() {
  return (
    <section className="screen diagrams">
      <figure>
        <img src="/docs/Workflow.png" alt="Workflow quản lý cơ sở vật chất" />
        <figcaption>Workflow vòng đời thiết bị</figcaption>
      </figure>
      <figure>
        <img src="/docs/Usecase diagram tong.png" alt="Usecase tổng quan quản lý cơ sở vật chất" />
        <figcaption>Usecase tổng quan</figcaption>
      </figure>
      <figure>
        <img src="/docs/Activity-Quan-ly-toa.png" alt="Activity diagram quản lý tòa" />
        <figcaption>Activity quản lý tòa</figcaption>
      </figure>
      <figure>
        <img src="/docs/Activity-Quan-ly-phong.png" alt="Activity diagram quản lý phòng" />
        <figcaption>Activity quản lý phòng</figcaption>
      </figure>
    </section>
  );
}

function RequestForm({
  title,
  form,
  setForm,
  createTicket,
  onClose,
  defaultTypes = typeOptions,
  fixedType,
  assetLabel = 'Thiết bị / hạng mục',
  requesterLabel = 'Đơn vị yêu cầu',
  departmentLabel = 'Đơn vị xử lý / nhận',
  helper,
  submitLabel = 'Tạo phiếu mẫu',
}) {
  return (
    <form className="panel request-form" onSubmit={createTicket}>
      <div className="panel-head">
        <h2>{title}</h2>
        {onClose ? <button className="ghost-button" type="button" onClick={onClose}>Đóng</button> : null}
      </div>
      {helper ? <p className="form-helper">{helper}</p> : null}
      <label>
        Loại phiếu
        {fixedType ? (
          <input value={fixedType} readOnly />
        ) : (
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {defaultTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        )}
      </label>
      <label>
        {assetLabel}
        <input required value={form.asset} onChange={(event) => setForm({ ...form, asset: event.target.value })} placeholder="VD: Máy chiếu Epson EB-X51" />
      </label>
      <label>
        {requesterLabel}
        <input value={form.requester} onChange={(event) => setForm({ ...form, requester: event.target.value })} />
      </label>
      <label>
        {departmentLabel}
        <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
      </label>
      <label>
        Mức ưu tiên
        <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
          <option>Thấp</option>
          <option>Trung bình</option>
          <option>Cao</option>
        </select>
      </label>
      <button className="primary" type="submit"><FilePlus2 size={18} />{submitLabel}</button>
    </form>
  );
}

function AssetTable({ assets }) {
  return (
    <div className="panel table-panel">
      <h2>Danh sách thiết bị</h2>
      <div className="table">
        <div className="table-row table-head"><span>Mã</span><span>Thiết bị</span><span>Vị trí</span><span>Tình trạng</span></div>
        {assets.map((asset) => (
          <div className="table-row" key={asset.id}>
            <span>{asset.id}</span>
            <span><strong>{asset.name}</strong><small>{asset.category}</small></span>
            <span><strong>{asset.department}</strong><small>{asset.room}</small></span>
            <span className={`pill ${statusTone[asset.status] || 'neutral'}`}>{asset.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketTable({ tickets, onApprove, compact = false }) {
  return (
    <div className="panel table-panel">
      <h2>{compact ? 'Phiếu đang mở' : 'Danh sách phiếu'}</h2>
      <div className="table tickets">
        <div className="table-row table-head"><span>Mã phiếu</span><span>Nghiệp vụ</span><span>Nội dung</span><span>Trạng thái</span><span></span></div>
        {tickets.map((ticket) => (
          <div className="table-row" key={ticket.id}>
            <span>{ticket.id}</span>
            <span>{ticket.type}</span>
            <span><strong>{ticket.asset}</strong><small>{ticket.requester} đến {ticket.department}</small></span>
            <span className={`pill ${statusTone[ticket.status] || 'neutral'}`}>{ticket.status}</span>
            <span>{onApprove && ticket.status === 'Chờ duyệt' ? <button onClick={() => onApprove(ticket.id)}>Duyệt</button> : null}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
