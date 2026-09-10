import { MOCK_WAREHOUSE_ITEMS } from '../data/warehouse';
import { WarehouseItem, InventoryCategory } from '../types';
import { apiFetch, mockFetch } from './api';

export const warehouseService = {
  async getInventory(categoryFilter?: InventoryCategory | 'All'): Promise<WarehouseItem[]> {
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await apiFetch<WarehouseItem[]>(`/api/warehouse/inventory${queryStr}`);
    } catch (err) {
      console.warn('Backend unavailable, falling back to local inventory:', err);
      let results = [...MOCK_WAREHOUSE_ITEMS];
      if (categoryFilter && categoryFilter !== 'All') {
        results = results.filter((item) => item.category === categoryFilter);
      }
      return mockFetch(results);
    }
  },

  async getLowStockAlerts(): Promise<WarehouseItem[]> {
    try {
      return await apiFetch<WarehouseItem[]>('/api/warehouse/alerts/low-stock');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local low stock:', err);
      const lowStock = MOCK_WAREHOUSE_ITEMS.filter((item) => item.status === 'LOW');
      return mockFetch(lowStock);
    }
  },

  async getExpiringItems(): Promise<WarehouseItem[]> {
    try {
      return await apiFetch<WarehouseItem[]>('/api/warehouse/alerts/expiring');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local expiring items:', err);
      const expiring = MOCK_WAREHOUSE_ITEMS.filter((item) => item.expiryDate);
      return mockFetch(expiring);
    }
  }
};
