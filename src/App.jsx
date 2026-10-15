import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Tags,
  Truck,
  Trash2,
  Unlock,
  Users,
  Wrench,
} from 'lucide-react';
import { api, getDepartmentManagerIds, lifecycleSteps, roles } from './mockApi';
import UserManagement from './UserManagement';
import DeviceManagement from './DeviceManagement';
import UsageManagement from './UsageManagement';
import WarehouseRequestForm from './WarehouseRequestForm';
import { ImportEquipmentTable } from './TicketEquipmentTable';
import { WarehouseTicketDetail, WarehouseTicketList } from './WarehouseTickets';
import { createImportGroup, createImportItem, prepareImportGroups } from './warehouseTickets';

const modules = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'locations', label: 'Khu vực', icon: Map },
  { id: 'catalogs', label: 'Thiết bị', icon: Tags },
  { id: 'departments', label: 'Phòng ban', icon: Users },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'warehouse', label: 'Kho', icon: Archive },
  { id: 'usage', label: 'Sử dụng', icon: PackageCheck },
  { id: 'maintenance', label: 'Bảo trì', icon: Wrench },
  { id: 'approval', label: 'Duyệt phiếu', icon: ClipboardCheck },
  { id: 'history', label: 'Lịch sử', icon: History },
  { id: 'diagrams', label: 'Sơ đồ', icon: Search },
];

const departmentStaffHiddenModules = ['catalogs', 'departments', 'warehouse', 'maintenance', 'approval'];

const typeOptions = ['Nhập kho', 'Cấp phát', 'Mượn / Trả', 'Điều chuyển', 'Báo hỏng / Sửa chữa', 'Thu hồi', 'Thanh lý'];

const warehouseActions = [
  {
    key: 'import',
    type: 'Nhập kho',
    title: 'Tạo phiếu nhập kho',
    actionLabel: 'Tạo phiếu nhập',
    menuLabel: 'Nhập',
    assetLabel: 'Hàng hóa / thiết bị nhập',
    requesterLabel: 'Người yêu cầu nhận',
    departmentLabel: 'Kho tiếp nhận',
    requester: 'Nhân viên CSVC',
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
    requester: 'Nhân viên CSVC',
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
  'Hỏng': 'red',
  'Sửa chữa': 'amber',
  'Bảo trì': 'blue',
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
    capacity: '',
    functionName: 'Phòng học',
    department: 'Phòng Đào tạo',
  });

  useEffect(() => {
    api.getDashboard().then(setData);
  }, []);

  const visibleModules = useMemo(
    () => modules.filter((module) => (module.id !== 'users' || role === roles[0]) && (role !== roles[2] || !departmentStaffHiddenModules.includes(module.id))),
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

  const refresh = useCallback(async () => setData(await api.getDashboard()), []);

  const createTicket = async (event, overridePayload, options = {}) => {
    event.preventDefault();
    const payload = overridePayload || form;
    if (!payload.asset?.trim()) return;
    const ticket = await api.createTicket({ ...payload, createdBy: role });
    setForm({ ...form, asset: '' });
    await refresh();
    if (!options.keepOnPage) setActive(canOpenModule('approval') ? 'approval' : 'usage');
    return ticket;
  };

  const createRoom = async (event) => {
    event.preventDefault();
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
    const ticket = await api.approveTicket(id, role);
    await refresh();
    return ticket;
  };
  const onApprove = role === roles[0] ? approveTicket : undefined;

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

        {currentActive === 'dashboard' && <Dashboard data={data} setActive={setActive} canOpenModule={canOpenModule} onApprove={onApprove} />}
        {currentActive === 'locations' && (
          <Locations
            data={data}
            refresh={refresh}
            roomForm={roomForm}
            setRoomForm={setRoomForm}
            createRoom={createRoom}
            toggleBuildingLock={toggleBuildingLock}
            toggleRoomLock={toggleRoomLock}
          />
        )}
        {currentActive === 'catalogs' && <DeviceManagement data={data} refresh={refresh} />}
        {currentActive === 'departments' && <Departments data={data} refresh={refresh} />}
        {currentActive === 'users' && <UserManagement data={data} refresh={refresh} />}
        {currentActive === 'warehouse' && <Warehouse data={data} refresh={refresh} createTicket={createTicket} onApprove={onApprove} />}
        {currentActive === 'usage' && <UsageManagement key="usage" data={data} refresh={refresh} createTicket={createTicket} actions={usageActions} onApprove={onApprove} />}
        {currentActive === 'maintenance' && <UsageManagement key="maintenance" page="maintenance" data={data} refresh={refresh} createTicket={createTicket} actions={maintenanceActions} onApprove={onApprove} />}
        {currentActive === 'approval' && <Approval data={data} role={role} approveTicket={approveTicket} />}
        {currentActive === 'history' && <AssetHistory data={data} query={query} setQuery={setQuery} filteredAssets={filteredAssets} />}
        {currentActive === 'diagrams' && <Diagrams />}
      </main>
    </div>
  );
}

function TicketDetail({ data, ticket, onBack, onApprove }) {
  const action = [...warehouseActions, ...usageActions, ...maintenanceActions].find((item) => item.type === ticket.type)
    || { requesterLabel: 'Người / đơn vị yêu cầu', departmentLabel: 'Đơn vị xử lý' };
  return <WarehouseTicketDetail ticket={ticket} action={action} departments={data.departments} assets={data.assets} categories={data.deviceCategories} onBack={onBack} onApprove={onApprove} />;
}

function Dashboard({ data, setActive, canOpenModule, onApprove }) {
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId);
  const stats = [
    ['Tổng thiết bị', data.stats.total, Archive],
    ['Trong kho', data.stats.inStock, Truck],
    ['Đang sử dụng', data.stats.inUse, Users],
    ['Phòng đang quản lý', data.stats.rooms, DoorOpen],
  ];

  if (selectedTicket) return <TicketDetail data={data} ticket={selectedTicket} onBack={() => setSelectedTicketId(null)} onApprove={onApprove} />;

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
        <TicketTable tickets={data.tickets.slice(0, 4)} compact onSelect={setSelectedTicketId} canApprove={!!onApprove} />
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

function Locations({ data, refresh, roomForm, setRoomForm, createRoom, toggleBuildingLock, toggleRoomLock }) {
  const [creating, setCreating] = useState(null);
  const [buildingForm, setBuildingForm] = useState({ code: '', name: '', note: '', floorCount: 1 });
  const [floorForm, setFloorForm] = useState({ buildingId: data.locations[0]?.id || '', number: 1 });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const openForm = (type) => { setCreating(type); setError(''); setNotice(''); };
  const selectRoomLocation = (building, floor = building?.floors[0]) => {
    setRoomForm((current) => ({ ...current, buildingId: building?.id || '', floorId: floor?.id || '', floorName: floor?.name || '' }));
  };
  const openFloor = (building) => {
    const nextNumber = Math.max(0, ...building.floors.map((floor) => floor.number ?? Number(floor.name.replace('Tầng ', '')))) + 1;
    setFloorForm({ buildingId: building.id, number: nextNumber });
    openForm('floor');
  };
  const assetCountByRoom = data.assets.reduce((map, asset) => {
    map[asset.roomId] = (map[asset.roomId] || 0) + 1;
    return map;
  }, {});

  const selectedBuilding = data.locations.find((building) => building.id === roomForm.buildingId) || data.locations[0];
  const submitLocation = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      if (creating === 'building') {
        const building = await api.createBuilding(buildingForm);
        await refresh();
        selectRoomLocation(building);
        setBuildingForm({ code: '', name: '', note: '', floorCount: 1 });
        setNotice(`Đã tạo ${building.name} với ${building.floors.length} tầng.`);
      } else if (creating === 'floor') {
        const floor = await api.createFloor(floorForm);
        await refresh();
        selectRoomLocation(data.locations.find((building) => building.id === floorForm.buildingId), floor);
        setNotice(`Đã tạo ${floor.name}. Bạn có thể tạo phòng trên tầng này.`);
      } else {
        await createRoom(event);
        setNotice('Đã tạo phòng thành công.');
      }
      setCreating(null);
    } catch (cause) {
      setError(cause.message || 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="screen split locations-layout">
      <div className="panel location-tree">
        <div className="panel-head">
          <h2>Cấu trúc khu vực</h2>
          <div className="panel-actions">
            <span className="role-chip">Tòa / tầng / phòng</span>
            <button className="primary" type="button" onClick={() => openForm('building')}>
              <Plus size={17} />Tạo tòa
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
                  <small>{building.note && `${building.note} - `}{building.floors.length} tầng - {roomCount} phòng - {assetCount} thiết bị</small>
                </div>
                <button className={building.locked ? 'lock danger' : 'lock'} onClick={() => toggleBuildingLock(building.id)}>
                  {building.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  {building.locked ? 'Đang khóa' : 'Đang mở'}
                </button>
              </div>
              <div className="location-tools">
                <button className="ghost-button" type="button" disabled={building.locked || saving} onClick={() => openFloor(building)}><Plus size={15} />Tạo tầng</button>
                {building.locked && <small>Mở khóa tòa để thêm tầng hoặc phòng.</small>}
              </div>
              {building.floors.map((floor) => (
                <div className="floor-branch" key={floor.id}>
                  <div className="floor-heading">
                    <div className="floor-title"><Layers size={16} />{floor.name}</div>
                    <button className="ghost-button" type="button" disabled={building.locked || saving} onClick={() => { selectRoomLocation(building, floor); openForm('room'); }}><Plus size={15} />Tạo phòng</button>
                  </div>
                  <div className="room-list">
                    {floor.rooms.length === 0 && <small>Chưa có phòng. Chọn “Tạo phòng” để thêm.</small>}
                    {floor.rooms.map((room) => (
                      <div className={`room-row ${room.locked ? 'is-locked' : ''}`} key={room.id}>
                        <div>
                          <strong>{room.name}</strong>
                          <small>{room.function}</small>
                          <small>Sức chứa: {room.capacity == null ? 'Chưa khai báo' : `${room.capacity} người`}</small>
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

      <div className="location-editor">
      {notice && <p className="location-notice" role="status">{notice}</p>}
      {creating === 'building' || creating === 'floor' ? (
        <form className="panel request-form" onSubmit={submitLocation}>
          <div className="panel-head">
            <h2>{creating === 'building' ? 'Tạo tòa' : 'Tạo tầng'}</h2>
            <button className="ghost-button" type="button" disabled={saving} onClick={() => openForm(null)}>Đóng</button>
          </div>
          <fieldset disabled={saving} className="location-fields">
          {creating === 'building' ? <>
            <label>Mã tòa<input required value={buildingForm.code} onChange={(event) => setBuildingForm({ ...buildingForm, code: event.target.value })} placeholder="VD: TOA-D" /></label>
            <label>Tên tòa<input required value={buildingForm.name} onChange={(event) => setBuildingForm({ ...buildingForm, name: event.target.value })} placeholder="VD: Tòa D" /></label>
            <label>Số tầng<input required type="number" min="1" max="100" step="1" value={buildingForm.floorCount} onChange={(event) => setBuildingForm({ ...buildingForm, floorCount: event.target.value })} /></label>
            <small>Tự động tạo Tầng 1 đến Tầng {buildingForm.floorCount || '…'}. Có thể thêm tầng sau.</small>
            <label>Ghi chú<input value={buildingForm.note} onChange={(event) => setBuildingForm({ ...buildingForm, note: event.target.value })} placeholder="VD: Khu giảng đường" /></label>
          </> : <>
            <label>Tòa trực thuộc<select required value={floorForm.buildingId} onChange={(event) => openFloor(data.locations.find((building) => building.id === event.target.value))}>
              {data.locations.map((building) => <option key={building.id} value={building.id} disabled={building.locked}>{building.name}{building.locked ? ' (Đang khóa)' : ''}</option>)}
            </select></label>
            <label>Số tầng<input required type="number" min="1" max="100" step="1" value={floorForm.number} onChange={(event) => setFloorForm({ ...floorForm, number: event.target.value })} /></label>
            <small>Tầng mới có tên “Tầng {floorForm.number || '…'}”.</small>
          </>}
          </fieldset>
          {error && <p className="location-error" role="alert">{error}</p>}
          <button className="primary" type="submit" disabled={saving}>{saving ? 'Đang tạo…' : creating === 'building' ? 'Tạo tòa và các tầng' : 'Tạo tầng'}</button>
        </form>
      ) : creating === 'room' ? (
        <form className="panel request-form" onSubmit={submitLocation}>
          <div className="panel-head">
            <h2>Tạo phòng</h2>
            <button className="ghost-button" type="button" disabled={saving} onClick={() => openForm(null)}>Đóng</button>
          </div>
          <fieldset disabled={saving} className="location-fields">
          <label>
            Tòa trực thuộc
            <select
              required
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
              {data.locations.map((building) => <option key={building.id} value={building.id} disabled={building.locked}>{building.name}{building.locked ? ' (Đang khóa)' : ''}</option>)}
            </select>
          </label>
          <label>
            Tầng
            <select
              required
              value={roomForm.floorId}
              onChange={(event) => {
                const floor = selectedBuilding?.floors.find((item) => item.id === event.target.value);
                setRoomForm({ ...roomForm, floorId: event.target.value, floorName: floor?.name || event.target.value });
              }}
            >
              {!selectedBuilding?.floors.length && <option value="">Tạo tầng trước khi tạo phòng</option>}
              {selectedBuilding?.floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name}</option>)}
            </select>
          </label>
          <label>
            Mã / số hiệu phòng
            <input required value={roomForm.roomCode} onChange={(event) => setRoomForm({ ...roomForm, roomCode: event.target.value })} placeholder="VD: A2.306" />
          </label>
          <label>
            Sức chứa (người)
            <input required type="number" min="1" step="1" value={roomForm.capacity} onChange={(event) => setRoomForm({ ...roomForm, capacity: event.target.value })} placeholder="VD: 40" />
          </label>
          <label>
            Công năng phòng
            <input value={roomForm.functionName} onChange={(event) => setRoomForm({ ...roomForm, functionName: event.target.value })} />
          </label>
          <label>
            Đơn vị phụ trách
            <input value={roomForm.department} onChange={(event) => setRoomForm({ ...roomForm, department: event.target.value })} />
          </label>
          </fieldset>
          {error && <p className="location-error" role="alert">{error}</p>}
          <button className="primary" type="submit" disabled={saving || !roomForm.floorId || selectedBuilding?.locked}><DoorOpen size={18} />{saving ? 'Đang tạo…' : 'Tạo phòng'}</button>
        </form>
      ) : (
        <div className="panel create-card">
          <h2>Quản lý khu vực</h2>
          <button className="primary" type="button" onClick={() => openForm('building')}><Building2 size={18} />Tạo tòa</button>
          <button className="primary" type="button" disabled={!data.locations.some((building) => !building.locked)} onClick={() => openFloor(data.locations.find((building) => !building.locked))}><Layers size={18} />Tạo tầng</button>
          <button className="primary" type="button" disabled={!data.locations.some((building) => !building.locked && building.floors.length)} onClick={() => {
            if (!selectedBuilding || selectedBuilding.locked || !selectedBuilding.floors.length) selectRoomLocation(data.locations.find((building) => !building.locked && building.floors.length));
            openForm('room');
          }}><DoorOpen size={18} />Tạo phòng</button>
          <div className="rules">
            <strong>Tạo nhanh cấu trúc khu vực</strong>
            <p>Nhập số tầng khi tạo tòa để sinh các tầng tự động. Chọn “Tạo phòng” tại từng tầng và khai sức chứa theo số người. Khóa tòa sẽ khóa các phòng phụ thuộc.</p>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

const emptyDepartmentForm = { id: '', name: '', managerIds: [], phone: '', note: '' };

function Departments({ data, refresh }) {
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);
  const [managerQuery, setManagerQuery] = useState('');
  const [notice, setNotice] = useState('');
  const users = Array.isArray(data.users) ? data.users : [];
  const managerNames = (department) => getDepartmentManagerIds(department, users).map((id) => users.find((user) => user.id === id)?.name || 'Người dùng không còn tồn tại');
  const availableManagers = users.filter((user) => `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(managerQuery.trim().toLowerCase()));
  const toggleManager = (id) => setDepartmentForm((current) => ({
    ...current,
    managerIds: current.managerIds.includes(id) ? current.managerIds.filter((managerId) => managerId !== id) : [...current.managerIds, id],
  }));
  const resetDepartmentForm = () => { setDepartmentForm(emptyDepartmentForm); setManagerQuery(''); setNotice(''); };

  useEffect(() => { refresh(); }, [refresh]);

  const filteredDepartments = useMemo(() => {
    const text = departmentQuery.trim().toLowerCase();
    if (!text) return data.departments;
    return data.departments.filter((item) => `${item.id} ${item.name} ${managerNames(item).join(' ')} ${item.phone} ${item.note}`.toLowerCase().includes(text));
  }, [data.departments, data.users, departmentQuery]);

  const saveDepartment = async (event) => {
    event.preventDefault();
    if (!departmentForm.name.trim()) return;
    await api.saveDepartment(departmentForm);
    await refresh();
    setDepartmentForm(emptyDepartmentForm);
    setManagerQuery('');
    setDepartmentQuery('');
    setNotice(departmentForm.id ? 'Đã cập nhật phòng ban và người phụ trách.' : 'Đã thêm phòng ban.');
  };

  const removeDepartment = async (id) => {
    await api.deleteDepartment(id);
    await refresh();
  };

  return (
    <section className="split wide catalog-layout">
      <CatalogForm title={departmentForm.id ? 'Sửa phòng ban' : 'Thêm phòng ban'} onSubmit={saveDepartment} onCancel={resetDepartmentForm} submitLabel="Lưu phòng ban">
        {notice && <p className="location-notice" role="status">{notice}</p>}
        <label>
          Tên phòng ban
          <input required value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} placeholder="VD: Phòng Đào tạo" />
        </label>
        <fieldset className="manager-picker">
          <legend>Người phụ trách</legend>
          <input aria-label="Tìm người phụ trách" value={managerQuery} onChange={(event) => setManagerQuery(event.target.value)} placeholder="Tìm tên, tài khoản hoặc email…" />
          <small>Đã chọn {departmentForm.managerIds.length} người{departmentForm.managerIds.length > 0 ? `: ${managerNames(departmentForm).join(', ')}` : ''}. Có thể chọn nhiều người.</small>
          <div className="manager-options">
            {availableManagers.map((user) => (
              <label className="manager-option" key={user.id}>
                <input type="checkbox" checked={departmentForm.managerIds.includes(user.id)} onChange={() => toggleManager(user.id)} />
                <span><strong>{user.name}</strong><small>@{user.username} · {user.role}{user.locked ? ' · Đã khóa' : ''}</small></span>
              </label>
            ))}
            {!users.length && <small>Chưa có người dùng. Thêm tại trang Người dùng để chọn người phụ trách.</small>}
            {users.length > 0 && !availableManagers.length && <small>Không tìm thấy người dùng phù hợp.</small>}
          </div>
        </fieldset>
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
              <span className="manager-names">{managerNames(item).length ? managerNames(item).map((name, index) => <small key={index}>{name}</small>) : <small>Chưa chọn người phụ trách</small>}</span>
              <span>{item.phone}</span>
              <span><small>{item.note}</small></span>
              <RowActions onEdit={() => { setDepartmentForm({ ...item, managerIds: getDepartmentManagerIds(item, users) }); setManagerQuery(''); setNotice(''); }} onDelete={() => removeDepartment(item.id)} />
            </div>
          ))}
        </div>
      </div>
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

function CatalogForm({ title, children, onSubmit, onCancel, submitLabel = 'Lưu danh mục' }) {
  return (
    <form className="panel request-form catalog-form" onSubmit={onSubmit}>
      <div className="panel-head">
        <h2>{title}</h2>
        <button className="ghost-button" type="button" onClick={onCancel}>Xóa form</button>
      </div>
      {children}
      <button className="primary" type="submit"><Save size={18} />{submitLabel}</button>
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

function ImportReceiptForm({ data, createTicket, onClose }) {
  const [receipt, setReceipt] = useState({
    supplier: '',
    carrier: '',
    requestCode: '',
    deliveryDate: new Date().toISOString().slice(0, 10),
    deliveryBatch: 'Đợt 1',
    requestDepartmentId: data.departments[0]?.id || '',
  });
  const [groups, setGroups] = useState(() => [createImportGroup()]);
  const [labelsReady, setLabelsReady] = useState(false);

  const [importError, setImportError] = useState('');
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);
  const barcodePreview = useMemo(() => groups.flatMap((group) => {
    const category = data.deviceCategories.find((item) => item.id === group.categoryId);
    return group.items.map((item, index) => ({
      ...item, key: `${group.id}-${item.key}`, categoryName: category?.name || 'Chưa chọn loại',
      name: item.name || `${category?.name || 'Thiết bị'} ${index + 1}`, order: index + 1,
    }));
  }), [data.deviceCategories, groups]);

  const changeGroups = (update) => {
    setLabelsReady(false);
    setImportError('');
    setGroups(update);
  };
  const updateGroup = (groupId, categoryId) => changeGroups((current) => current.map((group) => group.id === groupId ? { ...group, categoryId } : group));
  const addItem = (groupId) => changeGroups((current) => current.map((group) => group.id === groupId ? { ...group, items: [...group.items, createImportItem()] } : group));
  const removeItem = (groupId, itemKey) => changeGroups((current) => current.map((group) => group.id === groupId ? { ...group, items: group.items.filter((item) => item.key !== itemKey) } : group));
  const updateItem = (groupId, itemKey, field, value) => changeGroups((current) => current.map((group) => group.id !== groupId ? group : {
    ...group, items: group.items.map((item) => {
      if (item.key !== itemKey) return item;
      if (field === 'assetId') return { ...item, assetId: value, autoGenerated: false, ...(item.barcodeAutoGenerated ? { barcode: '', barcodeAutoGenerated: undefined } : {}) };
      if (field === 'barcode') return { ...item, barcode: value, barcodeAutoGenerated: false };
      return { ...item, [field]: value };
    }),
  }));
  const addGroup = () => changeGroups((current) => [...current, createImportGroup()]);
  const removeGroup = (groupId) => changeGroups((current) => current.filter((group) => group.id !== groupId));
  const generateAndPrintLabels = () => {
    setGroups((current) => {
      const prepared = prepareImportGroups(current, data.deviceCategories);
      return current.map((group) => prepared.find((item) => item.id === group.id) || group);
    });
    setLabelsReady(true);
  };

  const submitImport = async (event) => {
    event.preventDefault();
    const enrichedGroups = prepareImportGroups(groups, data.deviceCategories);
    if (!enrichedGroups.length) {
      setImportError('Chọn loại thiết bị và thêm ít nhất một thiết bị để tạo phiếu.');
      return;
    }
    const requestDepartment = data.departments.find((department) => department.id === receipt.requestDepartmentId);
    const totalQuantity = enrichedGroups.reduce((sum, group) => sum + group.items.length, 0);
    const assetSummary = enrichedGroups.map((group) => `${group.categoryName} (${group.items.length})`).join(', ');

    const ticket = await createTicket(event, {
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
    if (ticket) onClose();
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
          <h2>Loại thiết bị nhập</h2>
          <button className="primary" type="button" onClick={addGroup}><Plus size={17} />Thêm loại thiết bị</button>
        </div>
        <p className="form-helper">Chọn loại trước, sau đó thêm từng thiết bị. Số lượng được tính tự động theo danh sách bên trong.</p>
        <ImportEquipmentTable groups={groups} categories={data.deviceCategories}
          onCategoryChange={updateGroup} onRemoveGroup={removeGroup} onAddItem={addItem}
          onRemoveItem={removeItem} onItemChange={updateItem} />
        <strong>Tổng cộng: {new Set(groups.filter((group) => group.items.length).map((group) => group.categoryId)).size} loại · {totalItems} thiết bị</strong>
        {importError && <p className="location-error" role="alert">{importError}</p>}
      </div>
      <div className="barcode-print-section">
        <div className="panel-head">
          <h2>Sinh & in tem mã vạch</h2>
          <button className="primary compact-button" type="button" disabled={!totalItems} onClick={generateAndPrintLabels}>
            <Barcode size={18} />Sinh & in tem
          </button>
        </div>
        <p className="form-helper">Hệ thống dùng ID nhập tay hoặc tự sinh ID cho item còn trống, sau đó tạo tem mã vạch để dán lên thiết bị trước khi đưa hàng vào kho.</p>
        <div className="barcode-preview">
          <div className="barcode-row barcode-head"><span>Loại thiết bị</span><span>ID thiết bị</span><span>Mã in trên tem</span><span>Nguồn ID</span></div>
          {barcodePreview.map((item) => (
            <div className="barcode-row" key={item.key}>
              <span><strong>{item.name}</strong><small>{item.categoryName}</small></span>
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
        <small>{item.name || item.categoryName}</small>
      </div>
      <div className="barcode-art" aria-label={code}>
        {bars.map((width, index) => <i key={`${code}-${index}`} style={{ width: `${width}px` }} />)}
      </div>
      <span>{code}</span>
    </div>
  );
}

function Warehouse({ data, refresh, createTicket, onApprove }) {
  const [operation, setOperation] = useState('import');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const activeAction = warehouseActions.find((action) => action.key === operation);
  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId && ticket.type === activeAction.type);
  useEffect(() => { refresh(); }, [refresh]);
  const submitTicket = async (event, overridePayload) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const ticket = await createTicket(event, overridePayload, { keepOnPage: true });
      if (!ticket) return;
      setIsCreating(false);
      setSelectedTicketId(ticket.id);
    } catch (cause) {
      setError(cause.message || 'Không thể tạo phiếu. Vui lòng thử lại.');
      return null;
    } finally {
      setSaving(false);
    }
  };
  const openCreate = () => {
    setError('');
    setSelectedTicketId(null);
    setIsCreating(true);
  };
  const switchOperation = (key) => {
    setOperation(key);
    setSelectedTicketId(null);
    setIsCreating(false);
    setError('');
  };

  return (
    <section className="screen warehouse-screen">
      <div className="warehouse-operations" role="tablist" aria-label="Nghiệp vụ kho">
        {warehouseActions.map((action) => (
          <button type="button" role="tab" id={`warehouse-tab-${action.key}`} aria-selected={operation === action.key} aria-controls="warehouse-content" className={operation === action.key ? 'active' : ''} key={action.key} disabled={saving} onClick={() => switchOperation(action.key)}>
            <strong>{action.menuLabel}</strong><small>{data.tickets.filter((ticket) => ticket.type === action.type).length} phiếu</small>
          </button>
        ))}
      </div>
      {error && <p className="location-error" role="alert">{error}</p>}
      <div id="warehouse-content" role="tabpanel" aria-labelledby={`warehouse-tab-${operation}`}>
        {isCreating ? (
          <fieldset className="warehouse-create-shell" disabled={saving}>
            {activeAction.key === 'import' ? (
              <ImportReceiptForm data={data} createTicket={submitTicket} onClose={() => setIsCreating(false)} />
            ) : (
              <WarehouseRequestForm data={data} action={activeAction} createTicket={submitTicket} onClose={() => setIsCreating(false)} />
            )}
          </fieldset>
        ) : selectedTicket ? (
          <WarehouseTicketDetail ticket={selectedTicket} action={activeAction} departments={data.departments} assets={data.assets} categories={data.deviceCategories} onBack={() => setSelectedTicketId(null)} onApprove={onApprove} />
        ) : (
          <WarehouseTicketList key={operation} tickets={data.tickets} assets={data.assets} categories={data.deviceCategories} action={activeAction} onSelect={setSelectedTicketId} onCreate={openCreate} />
        )}
      </div>
      <details className="panel warehouse-inventory">
        <summary>Tồn kho và lịch sử biến động</summary>
        <StockQuantity data={data} />
      </details>
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
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId);
  if (selectedTicket) return <TicketDetail data={data} ticket={selectedTicket} onBack={() => setSelectedTicketId(null)} onApprove={canApprove ? approveTicket : undefined} />;
  return (
    <section className="screen">
      <div className="panel">
        <div className="panel-head">
          <h2>Hàng đợi nghiệp vụ</h2>
          <span className="role-chip">{canApprove ? 'Có quyền duyệt' : 'Chỉ xem / xử lý nghiệp vụ'}</span>
        </div>
        <p className="form-helper">Chọn phiếu để xem thông tin, danh sách thiết bị và lịch sử xử lý trước khi duyệt.</p>
        <TicketTable tickets={data.tickets} onSelect={setSelectedTicketId} canApprove={canApprove} />
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
  children,
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
      {children}
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

function TicketTable({ tickets, onSelect, canApprove = false, compact = false }) {
  return (
    <div className="panel table-panel">
      <h2>{compact ? 'Phiếu đang mở' : 'Danh sách phiếu'}</h2>
      <div className="table tickets">
        <div className="table-row table-head"><span>Mã phiếu</span><span>Nghiệp vụ</span><span>Nội dung</span><span>Trạng thái</span><span></span></div>
        {tickets.map((ticket) => (
          <div className="table-row warehouse-ticket-row" key={ticket.id} onClick={() => onSelect(ticket.id)}>
            <span><button className="ticket-code" type="button" aria-label={`Xem phiếu ${ticket.id}`}>{ticket.id}</button></span>
            <span>{ticket.type}</span>
            <span><strong>{ticket.asset}</strong><small>{ticket.requester} đến {ticket.department}</small></span>
            <span className={`pill ${statusTone[ticket.status] || 'neutral'}`}>{ticket.status}</span>
            <span><button className="ghost-button" type="button" aria-label={`Xem chi tiết ${ticket.id}`}>{canApprove && ticket.status === 'Chờ duyệt' ? 'Xem / Duyệt' : 'Xem'}</button></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
