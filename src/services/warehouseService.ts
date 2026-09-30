import { WarehouseItem, InventoryCategory, StockMovement } from '../types';
import { apiFetch } from './api';

export interface StockMovementInput {
  itemId: string;
  quantity: number;
  fromTo: string;
  reference?: string;
  notes?: string;
}

/** Warehouse logistics (coordinators only). Stock changes are saved on the server. */
export const warehouseService = {
  getInventory(categoryFilter?: InventoryCategory | 'All'): Promise<WarehouseItem[]> {
    const query = categoryFilter && categoryFilter !== 'All' ? `?category=${encodeURIComponent(categoryFilter)}` : '';
    return apiFetch<WarehouseItem[]>(`/api/warehouse/inventory${query}`);
  },

  getLowStockAlerts(): Promise<WarehouseItem[]> {
    return apiFetch<WarehouseItem[]>('/api/warehouse/alerts/low-stock');
  },

  getExpiringItems(): Promise<WarehouseItem[]> {
    return apiFetch<WarehouseItem[]>('/api/warehouse/alerts/expiring');
  },

  getMovements(limit = 50): Promise<StockMovement[]> {
    return apiFetch<StockMovement[]>(`/api/warehouse/movements?limit=${limit}`);
  },

  receiveStock(input: StockMovementInput): Promise<{ item: WarehouseItem; movement: StockMovement }> {
    return apiFetch('/api/warehouse/receive', { method: 'POST', body: JSON.stringify(input) });
  },

  dispatchStock(input: StockMovementInput): Promise<{ item: WarehouseItem; movement: StockMovement }> {
    return apiFetch('/api/warehouse/dispatch', { method: 'POST', body: JSON.stringify(input) });
  }
};
