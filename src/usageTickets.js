let usageGroupSequence = 0;
export const createUsageGroup = () => ({ id: `usage-${Date.now()}-${++usageGroupSequence}`, categoryId: '', assetIds: [] });

export function toVietnamTimestamp(value) {
  if (!value) return '';
  if (/(Z|[+-]\d{2}:\d{2})$/.test(value)) return value;
  return `${value.length === 16 ? `${value}:00` : value}+07:00`;
}

export function prepareUsageItems(groups, assets, categories) {
  const seen = new Set();
  return groups.flatMap((group) => group.assetIds.flatMap((id) => {
    if (seen.has(id)) return [];
    const asset = assets.find((asset) => asset.id === id && asset.categoryId === group.categoryId);
    if (!asset) return [];
    seen.add(id);
    return [{ assetId: asset.id, name: asset.name, barcode: asset.barcode || '', categoryId: asset.categoryId,
      categoryName: categories.find((category) => category.id === asset.categoryId)?.name || asset.category,
      quantity: 1, approvalStatus: 'Chờ duyệt' }];
  }));
}
