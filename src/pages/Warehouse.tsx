import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Plus, Search } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { warehouseService } from '../services/warehouseService';
import { WarehouseItem, InventoryCategory } from '../types';
import './Warehouse.css';

export const Warehouse: React.FC = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory]);

  const fetchInventory = async () => {
    const list = await warehouseService.getInventory(selectedCategory);
    setItems(list);
  };

  const categories: Array<InventoryCategory | 'All'> = [
    'All',
    'Food',
    'Water',
    'Medicine',
    'Hygiene',
    'Rescue Equipment',
    'Shelter'
  ];

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container warehouse-page">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Warehouse &amp; Inventory</h1>
            <p className="text-xs text-muted">Live inventory across all registered warehouses</p>
          </div>
          <Button variant="primary" size="md">
            <Plus size={14} /> Receive Stock
          </Button>
        </div>

        {/* Alert Banners */}
        <div className="grid-2 gap-4 mb-6">
          <div className="w-banner banner-red">
            <AlertTriangle size={16} className="text-danger flex-shrink-0" />
            <div>
              <strong className="text-xs">3 Items Below Minimum Stock</strong>
              <div className="text-xs text-muted mt-0.5">Insulin (Rapid-acting), Menstrual Hygiene Kit, Baby Food (Formula)</div>
            </div>
          </div>

          <div className="w-banner banner-yellow">
            <Clock size={16} className="text-warning flex-shrink-0" />
            <div>
              <strong className="text-xs">3 Items Expiring Within 60 Days</strong>
              <div className="text-xs text-muted mt-0.5">Oral Saline (ORS), Insulin (Rapid-acting), Baby Food (Formula)</div>
            </div>
          </div>
        </div>

        {/* Category Filters + Search */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`w-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-search-box">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="Filter by item or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-search-input"
            />
          </div>
        </div>

        {/* Inventory Data Table */}
        <Card className="table-card p-0">
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Warehouse</th>
                  <th>Last Count</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-xs text-muted font-mono">{item.sku}</div>
                    </td>
                    <td><span className="cat-chip">{item.category}</span></td>
                    <td className="font-mono font-bold">
                      {item.availableCount.toLocaleString()} <span className="text-xs text-muted font-normal">{item.unit}</span>
                    </td>
                    <td className="font-mono text-muted">{item.reservedCount.toLocaleString()}</td>
                    <td className="font-mono text-muted">{item.minStockThreshold.toLocaleString()}</td>
                    <td>
                      <Badge variant={item.status === 'LOW' ? 'HIGH' : item.status === 'CAUTION' ? 'MEDIUM' : 'LOW'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs text-muted">
                      {item.expiryDate ? <span className="text-danger font-bold">{item.expiryDate}</span> : '—'}
                    </td>
                    <td className="text-xs">{item.warehouseName}</td>
                    <td className="text-xs text-muted">{item.lastCountDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
