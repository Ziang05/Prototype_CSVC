import { prepareUsageItems } from './usageTickets.js';

export function prepareMaintenanceItems(groups, assets, categories, itemDetails = {}) {
  return prepareUsageItems(groups, assets, categories).map((item) => ({
    ...item,
    repairRequest: itemDetails[item.assetId]?.repairRequest || '',
    relatedDamageTicketId: itemDetails[item.assetId]?.relatedDamageTicketId || '',
  }));
}
