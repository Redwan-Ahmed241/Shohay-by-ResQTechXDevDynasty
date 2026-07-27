import { MOCK_WAREHOUSE_ITEMS } from '../data/warehouse';
import { WarehouseItem, InventoryCategory } from '../types';
import { mockFetch } from './api';

export const warehouseService = {
  async getInventory(categoryFilter?: InventoryCategory | 'All'): Promise<WarehouseItem[]> {
    let results = [...MOCK_WAREHOUSE_ITEMS];
    if (categoryFilter && categoryFilter !== 'All') {
      results = results.filter((item) => item.category === categoryFilter);
    }
    return mockFetch(results);
  },

  async getLowStockAlerts(): Promise<WarehouseItem[]> {
    const lowStock = MOCK_WAREHOUSE_ITEMS.filter((item) => item.status === 'LOW');
    return mockFetch(lowStock);
  },

  async getExpiringItems(): Promise<WarehouseItem[]> {
    const expiring = MOCK_WAREHOUSE_ITEMS.filter((item) => item.expiryDate);
    return mockFetch(expiring);
  }
};
