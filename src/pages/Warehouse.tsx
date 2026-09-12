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
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [receiveQty, setReceiveQty] = useState<number>(100);
  const [receiveNotes, setReceiveNotes] = useState<string>('Emergency relief shipment intake');
  const [notification, setNotification] = useState<string | null>(null);

  const [movements, setMovements] = useState([
    { id: 'mov-1', date: '2024-07-15 14:30', type: 'INBOUND', item: 'Rice (5 kg bag)', qty: '+500 bags', fromTo: 'Central Depot → Sylhet Central', ref: 'PO-8821' },
    { id: 'mov-2', date: '2024-07-15 11:15', type: 'DISPATCH', item: 'Drinking Water (10 L)', qty: '-200 bottles', fromTo: 'Sirajganj Store → Kazipur Shelter', ref: 'REQ-SHY-89211' },
    { id: 'mov-3', date: '2024-07-14 16:45', type: 'INBOUND', item: 'Water Purification Tablets', qty: '+5000 tablets', fromTo: 'WHO Relief Donor → Feni Store', ref: 'DON-4410' },
    { id: 'mov-4', date: '2024-07-14 09:20', type: 'DISPATCH', item: 'Oral Saline (ORS)', qty: '-300 packets', fromTo: 'Sylhet Central → Chhatak Clinic', ref: 'DIS-2918' },
  ]);

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory]);

  const fetchInventory = async () => {
    const list = await warehouseService.getInventory(selectedCategory);
    setItems(list);
    if (list.length > 0 && !selectedItemId) {
      setSelectedItemId(list[0].id);
    }
  };

  const handleReceiveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;

    const newQty = item.availableCount + Number(receiveQty);
    const newStatus = newQty >= item.minStockThreshold ? 'OK' : 'LOW';

    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedItemId
          ? { ...i, availableCount: newQty, status: newStatus as any }
          : i
      )
    );

    const newMov = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'INBOUND',
      item: item.name,
      qty: `+${receiveQty} ${item.unit}s`,
      fromTo: `Logistics Supply → ${item.warehouseName}`,
      ref: `RCV-${Date.now().toString().slice(-4)}`
    };
    setMovements((prev) => [newMov, ...prev]);

    setIsReceiveModalOpen(false);
    setNotification(`Successfully received ${receiveQty} ${item.unit}s of ${item.name}!`);
    setTimeout(() => setNotification(null), 4000);
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
            <button className="btn-receive-stock" onClick={() => setIsReceiveModalOpen(true)}>
              <Plus size={14} /> Receive Stock
            </button>
          </div>

          {notification && (
            <div style={{ padding: '10px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
              ✓ {notification}
            </div>
          )}

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
              Movements ({movements.length})
            </button>
          </div>

          {activeTab === 'inventory' ? (
            <>
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
            </>
          ) : (
            /* Movements Log View */
            <div className="inventory-table-card">
              <table className="inventory-data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Origin / Destination</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{m.date}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: m.type === 'INBOUND' ? '#ecfdf5' : '#eff6ff',
                          color: m.type === 'INBOUND' ? '#059669' : '#2563eb'
                        }}>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{m.item}</td>
                      <td style={{ fontWeight: 700, color: m.type === 'INBOUND' ? '#059669' : '#dc2626' }}>{m.qty}</td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>{m.fromTo}</td>
                      <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{m.ref}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receive Stock Modal */}
          {isReceiveModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(3px)'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '480px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>📦 Receive Inbound Stock</h3>
                  <button onClick={() => setIsReceiveModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
                </div>
                <form onSubmit={handleReceiveStockSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Item</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
                      required
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.warehouseName}) — Current: {i.availableCount} {i.unit}s
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Quantity Received</label>
                    <input
                      type="number"
                      min="1"
                      value={receiveQty}
                      onChange={(e) => setReceiveQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Notes / Consignment Ref</label>
                    <input
                      type="text"
                      value={receiveNotes}
                      onChange={(e) => setReceiveNotes(e.target.value)}
                      placeholder="e.g. Red Crescent Relief Truck #4"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsReceiveModalOpen(false)}
                      style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '9px 20px', borderRadius: '6px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Confirm Intake
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
