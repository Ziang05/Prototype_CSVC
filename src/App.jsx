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
        {currentActive === 'maintenance' && <Maintenance form={form} setForm={setForm} createTicket={createTicket} />}
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
    <section className={`screen split ${activeAction?.key === 'import' ? 'import-layout' : 'wide'}`}>
      {activeAction ? (
        activeAction.key === 'import' ? (
          <ImportReceiptForm data={data} createTicket={createTicket} onClose={() => setActiveAction(null)} />
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
    <section className="screen split wide">
      {activeAction ? (
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
      ) : (
        <ActionPicker title="Nghiệp vụ sử dụng" actions={usageActions} onCreate={openAction} />
      )}
      <AssetTable assets={data.assets.filter((asset) => asset.status !== 'Trong kho')} />
    </section>
  );
}

function Maintenance({ form, setForm, createTicket }) {
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
    <section className="screen split wide">
      {activeAction ? (
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
    <section className="screen split wide">
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
