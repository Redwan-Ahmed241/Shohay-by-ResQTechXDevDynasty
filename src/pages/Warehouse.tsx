import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Plus } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { warehouseService } from '../services/warehouseService';
import { WarehouseItem, InventoryCategory } from '../types';
import './Warehouse.css';

export const Warehouse: React.FC = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OK':
        return 'w-badge-ok';
      case 'LOW':
        return 'w-badge-low';
      case 'CAUTION':
        return 'w-badge-caution';
      default:
        return '';
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="warehouse-page-bg">
        <div className="warehouse-container">
          {/* Header Row matching Figma */}
          <div className="warehouse-header-row">
            <div>
              <h1 className="warehouse-title">Warehouse &amp; Inventory</h1>
              <p className="warehouse-subtitle">Live inventory across all registered warehouses</p>
            </div>
            <button className="btn-receive-stock">
              <Plus size={14} /> Receive Stock
            </button>
          </div>

          {/* Alert Banners (Red & Yellow) matching Figma */}
          <div className="warehouse-alerts-grid">
            <div className="w-banner banner-red">
              <AlertTriangle size={16} className="icon-red" />
              <div>
                <div className="w-banner-title title-red">3 Items Below Minimum Stock</div>
                <div className="w-banner-desc desc-red">Insulin (Rapid-acting), Menstrual Hygiene Kit, Baby Food (Formula)</div>
              </div>
            </div>

            <div className="w-banner banner-yellow">
              <Clock size={16} className="icon-yellow" />
              <div>
                <div className="w-banner-title title-yellow">3 Items Expiring Within 60 Days</div>
                <div className="w-banner-desc desc-yellow">Oral Saline (ORS), Insulin (Rapid-acting), Baby Food (Formula)</div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="warehouse-sub-tabs">
            <button
              className={`w-sub-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
            <button
              className={`w-sub-tab ${activeTab === 'movements' ? 'active' : ''}`}
              onClick={() => setActiveTab('movements')}
            >
              Movements
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="warehouse-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`w-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Inventory Table Container */}
          <div className="inventory-table-card">
            <table className="inventory-data-table">
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
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="item-name-text">{item.name}</div>
                      <div className="item-sku-text">#{item.sku}</div>
                    </td>
                    <td>
                      <span className="cat-plain-text">{item.category}</span>
                    </td>
                    <td>
                      <span className="count-num-bold">{item.availableCount.toLocaleString()}</span>{' '}
                      <span className="count-unit-sub">{item.unit}</span>
                    </td>
                    <td>
                      <span className="count-num-plain">{item.reservedCount.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="count-num-plain">{item.minStockThreshold.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`w-status-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.expiryDate ? (
                        <span className="expiry-red-text">{item.expiryDate}</span>
                      ) : (
                        <span className="expiry-dash">—</span>
                      )}
                    </td>
                    <td>
                      <span className="warehouse-location-text">{item.warehouseName}</span>
                    </td>
                    <td>
                      <span className="count-date-text">{item.lastCountDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
