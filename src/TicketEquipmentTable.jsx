import { Plus, Trash2 } from 'lucide-react';

function CategoryCells({ group, index, categories, groups, rowSpan, quantity, onCategoryChange, onRemoveGroup, allowDuplicateCategories = false }) {
  return <>
    <td className="equipment-category-cell" rowSpan={rowSpan}>
      <div className="equipment-category-control">
        <select aria-label={`Loại thiết bị nhóm ${index + 1}`} value={group.categoryId} onChange={(event) => onCategoryChange(group.id, event.target.value)}>
          <option value="">Chọn loại thiết bị</option>
          {categories.map((category) => <option key={category.id} value={category.id} disabled={!allowDuplicateCategories && groups.some((other) => other.id !== group.id && other.categoryId === category.id)}>{category.name}</option>)}
        </select>
        <button className="ghost-button danger-text equipment-remove" type="button" aria-label={`Xóa nhóm loại thiết bị ${index + 1}`} title="Xóa loại" onClick={() => onRemoveGroup(group.id)}><Trash2 size={16} /></button>
      </div>
    </td>
    <td className="equipment-quantity-cell" rowSpan={rowSpan}><output aria-label={`Số lượng nhóm ${index + 1}`}>{quantity}</output></td>
  </>;
}

export function EquipmentSelectionTable({ groups, categories, assets, query, onCategoryChange, onRemoveGroup, onToggleAsset, repair = false, itemDetails = {}, onItemDetailChange, tickets = [] }) {
  const search = query.trim().toLowerCase();
  return <div className="equipment-table-wrap ticket-equipment-wrap">
    <table className={`equipment-table ticket-equipment-table ${repair ? 'repair-equipment-table' : ''}`} aria-label="Danh sách thiết bị để chọn">
      <thead><tr><th scope="col">Loại thiết bị</th><th scope="col">SL đã chọn</th><th scope="col">Chọn</th><th scope="col">{repair ? 'Thiết bị / mã vạch' : 'Thiết bị / mã'}</th>{repair ? <><th scope="col">Yêu cầu sửa chữa</th><th scope="col">Báo hỏng liên quan</th></> : <><th scope="col">Mã vạch</th><th scope="col">Tình trạng</th></>}</tr></thead>
      {groups.map((group, index) => {
        const candidates = group.categoryId ? assets.filter((asset) => asset.categoryId === group.categoryId && (group.assetIds.includes(asset.id) || `${asset.name} ${asset.id} ${asset.barcode || ''}`.toLowerCase().includes(search))) : [];
        const categoryCells = <CategoryCells group={group} index={index} categories={categories} groups={groups} rowSpan={Math.max(1, candidates.length)} quantity={group.assetIds.length} onCategoryChange={onCategoryChange} onRemoveGroup={onRemoveGroup} />;
        return <tbody key={group.id}>
          {candidates.length ? candidates.map((asset, assetIndex) => {
            const selected = group.assetIds.includes(asset.id);
            const relatedReports = repair ? tickets.filter((ticket) => ticket.type === 'Báo hỏng / Sửa chữa' && ticket.details?.lineItems?.some((item) => item.assetId === asset.id)) : [];
            return <tr key={asset.id} className={selected ? 'equipment-selected-row' : ''}>
              {assetIndex === 0 && categoryCells}
              <td className="equipment-check-cell"><input id={`${group.id}-${asset.id}`} type="checkbox" aria-label={`Chọn ${asset.name} (${asset.id})`} checked={selected} onChange={() => onToggleAsset(group.id, asset.id)} /></td>
              <td><label className="equipment-device-label" htmlFor={`${group.id}-${asset.id}`}><strong>{asset.name}</strong><small>{asset.id}</small>{repair && <><small>{asset.barcode || 'Chưa khai báo mã vạch'}</small><small>{asset.status}</small></>}</label></td>
              {!repair && <><td>{asset.barcode || 'Chưa khai báo'}</td><td>{asset.status}</td></>}
              {repair && <>
                <td><input aria-label={`Yêu cầu sửa chữa ${asset.name}`} disabled={!selected} value={itemDetails[asset.id]?.repairRequest || ''} onChange={(event) => onItemDetailChange(asset.id, 'repairRequest', event.target.value)} placeholder={selected ? 'Nhập yêu cầu sửa' : 'Chọn thiết bị trước'} /></td>
                <td><select aria-label={`Báo hỏng liên quan ${asset.name}`} disabled={!selected} value={itemDetails[asset.id]?.relatedDamageTicketId || ''} onChange={(event) => onItemDetailChange(asset.id, 'relatedDamageTicketId', event.target.value)}><option value="">Không liên kết</option>{relatedReports.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.id} — {ticket.details.damageDescription || ticket.asset}</option>)}</select></td>
              </>}
            </tr>;
          }) : <tr>{categoryCells}<td className="equipment-empty-cell" colSpan={4}>{group.categoryId ? 'Không có thiết bị phù hợp với tìm kiếm.' : 'Chọn loại để xem thiết bị.'}</td></tr>}
        </tbody>;
      })}
      {!groups.length && <tbody><tr><td className="equipment-empty-cell" colSpan={6}>Chọn “Thêm loại thiết bị” để bắt đầu.</td></tr></tbody>}
    </table>
  </div>;
}

export function ImportEquipmentTable({ groups, categories, onCategoryChange, onRemoveGroup, onAddItem, onRemoveItem, onItemChange }) {
  return <div className="equipment-table-wrap ticket-equipment-wrap">
    <table className="equipment-table ticket-equipment-table import-equipment-table" aria-label="Danh sách thiết bị nhập kho">
      <thead><tr>{['Loại thiết bị', 'Số lượng', 'Tên thiết bị', 'Mã thiết bị', 'Mã vạch', ''].map((heading, index) => <th key={index} scope="col">{heading || <span className="visually-hidden">Thao tác</span>}</th>)}</tr></thead>
      {groups.map((group, groupIndex) => {
        const categoryCells = <CategoryCells group={group} index={groupIndex} categories={categories} groups={groups} rowSpan={group.items.length + 1} quantity={group.items.length} onCategoryChange={onCategoryChange} onRemoveGroup={onRemoveGroup} allowDuplicateCategories />;
        return <tbody key={group.id}>
          {group.items.map((item, index) => <tr key={item.key}>
            {index === 0 && categoryCells}
            <td><input aria-label={`Tên thiết bị ${index + 1} nhóm ${groupIndex + 1}`} value={item.name} onChange={(event) => onItemChange(group.id, item.key, 'name', event.target.value)} placeholder="VD: TV Samsung A1" /></td>
            <td><input aria-label={`Mã thiết bị ${index + 1} nhóm ${groupIndex + 1}`} value={item.assetId} onChange={(event) => onItemChange(group.id, item.key, 'assetId', event.target.value)} placeholder="Tự sinh nếu để trống" /></td>
            <td><input aria-label={`Mã vạch thiết bị ${index + 1} nhóm ${groupIndex + 1}`} value={item.barcode} onChange={(event) => onItemChange(group.id, item.key, 'barcode', event.target.value)} placeholder="Tự sinh nếu để trống" /></td>
            <td><button className="ghost-button danger-text equipment-remove" type="button" aria-label={`Xóa thiết bị ${index + 1} nhóm ${groupIndex + 1}`} title="Xóa thiết bị" onClick={() => onRemoveItem(group.id, item.key)}><Trash2 size={16} /></button></td>
          </tr>)}
          <tr className="equipment-add-row">
            {!group.items.length && categoryCells}
            <td colSpan={4}><button className="ghost-button" type="button" disabled={!group.categoryId} aria-label={`Thêm thiết bị nhóm ${groupIndex + 1}`} onClick={() => onAddItem(group.id)}><Plus size={15} />Thêm thiết bị</button></td>
          </tr>
        </tbody>;
      })}
      {!groups.length && <tbody><tr><td className="equipment-empty-cell" colSpan={6}>Chọn “Thêm loại thiết bị” để bắt đầu.</td></tr></tbody>}
    </table>
  </div>;
}
