import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, Plus, Truck } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFlash } from '../hooks/useFlash';
import { warehouseService } from '../services/warehouseService';
import { ApiError } from '../services/api';
import { WarehouseItem, InventoryCategory, StockMovement } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './Warehouse.css';

type MoveMode = 'receive' | 'dispatch';

const EXPIRY_WINDOW_DAYS = 60;

function expiresSoon(item: WarehouseItem): boolean {
  if (!item.expiryDate) return false;
  const days = (new Date(item.expiryDate).getTime() - Date.now()) / 86_400_000;
  return days <= EXPIRY_WINDOW_DAYS;
}

function errorText(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Could not reach the Shohay server.';
}

const fieldStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' };

export const Warehouse: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [allItems, setAllItems] = useState<WarehouseItem[]>([]); // unfiltered, for banners and the form
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [loadError, setLoadError] = useState<string | null>(null);
  const { notice: notification, flash } = useFlash();

  // Receive / dispatch form
  const [moveMode, setMoveMode] = useState<MoveMode | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);
  const [fromTo, setFromTo] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [everything, moves] = await Promise.all([warehouseService.getInventory('All'), warehouseService.getMovements()]);
      setAllItems(everything);
      setMovements(moves);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setItems(selectedCategory === 'All' ? allItems : allItems.filter((i) => i.category === selectedCategory));
  }, [allItems, selectedCategory]);

  const openForm = (mode: MoveMode) => {
    const first = allItems[0];
    setMoveMode(mode);
    setSelectedItemId(first?.id || '');
    setQuantity(mode === 'receive' ? 100 : 10);
    setFromTo(first ? (mode === 'receive' ? `Donor / supplier → ${first.warehouseName}` : `${first.warehouseName} → `) : '');
    setReference('');
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = allItems.find((i) => i.id === selectedItemId);
    if (!item || !moveMode) return;
    setIsSaving(true);
    try {
      const input = { itemId: item.id, quantity, fromTo, reference: reference || undefined };
      const result = moveMode === 'receive' ? await warehouseService.receiveStock(input) : await warehouseService.dispatchStock(input);
      setAllItems((prev) => prev.map((i) => (i.id === item.id ? result.item : i)));
      setMovements((prev) => [result.movement, ...prev]);
      setMoveMode(null);
      flash('ok', `${moveMode === 'receive' ? 'Received' : 'Dispatched'} ${quantity} ${item.unit} of ${item.name}. Stock is now ${result.item.availableCount}.`);
    } catch (err) {
      flash('error', errorText(err));
    } finally {
      setIsSaving(false);
    }
  };

  const categories: Array<{ id: InventoryCategory | 'All'; labelKey: string }> = [
    { id: 'All', labelKey: 'whCatAll' },
    { id: 'Food', labelKey: 'whCatFood' },
    { id: 'Water', labelKey: 'whCatWater' },
    { id: 'Medicine', labelKey: 'whCatMedicine' },
    { id: 'Hygiene', labelKey: 'whCatHygiene' },
    { id: 'Rescue Equipment', labelKey: 'whCatRescueEquipment' },
    { id: 'Shelter', labelKey: 'whCatShelter' }
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

  const lowStock = allItems.filter((i) => i.status === 'LOW');
  const expiring = allItems.filter(expiresSoon);
  const selectedItem = allItems.find((i) => i.id === selectedItemId);

  return (
    <PageLayout showAlertBanner={false}>
      <div className="warehouse-page-bg">
        <div className="warehouse-container">
          <div className="warehouse-header-row">
            <div>
              <h1 className="warehouse-title">{t('warehouseTitle')}</h1>
              <p className="warehouse-subtitle">{t('warehouseSubtitle')}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-receive-stock" onClick={() => openForm('dispatch')} disabled={allItems.length === 0} style={{ background: '#1e40af' }}>
                <Truck size={14} /> Dispatch Stock
              </button>
              <button className="btn-receive-stock" onClick={() => openForm('receive')} disabled={allItems.length === 0}>
                <Plus size={14} /> {t('warehouseReceiveStock')}
              </button>
            </div>
          </div>

          {notification && (
            <div role={notification.kind === 'error' ? 'alert' : 'status'} style={{
              padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px',
              background: notification.kind === 'ok' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${notification.kind === 'ok' ? '#a7f3d0' : '#fecaca'}`,
              color: notification.kind === 'ok' ? '#065f46' : '#991b1b'
            }}>
              {notification.kind === 'ok' ? '✓ ' : ''}{notification.text}
            </div>
          )}

          {loadError && (
            <div role="alert" style={{ padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Could not load inventory: {loadError}</span>
              <button onClick={loadAll} style={{ border: 'none', background: 'none', color: '#991b1b', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          <div className="warehouse-alerts-grid">
            <div className="w-banner banner-red">
              <AlertTriangle size={16} className="icon-red" />
              <div>
                <div className="w-banner-title title-red">{lowStock.length} Item{lowStock.length === 1 ? '' : 's'} Below Minimum Stock</div>
                <div className="w-banner-desc desc-red">{lowStock.map((i) => i.name).join(', ') || 'All items are above their minimum.'}</div>
              </div>
            </div>

            <div className="w-banner banner-yellow">
              <Clock size={16} className="icon-yellow" />
              <div>
                <div className="w-banner-title title-yellow">{expiring.length} Item{expiring.length === 1 ? '' : 's'} Expired or Expiring Within {EXPIRY_WINDOW_DAYS} Days</div>
                <div className="w-banner-desc desc-yellow">{expiring.map((i) => `${i.name} (${i.expiryDate})`).join(', ') || 'Nothing expiring soon.'}</div>
              </div>
            </div>
          </div>

          <div className="warehouse-sub-tabs">
            <button
              className={`w-sub-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              {t('warehouseTabInventory')}
            </button>
            <button
              className={`w-sub-tab ${activeTab === 'movements' ? 'active' : ''}`}
              onClick={() => setActiveTab('movements')}
            >
              {t('warehouseTabMovements')} ({movements.length})
            </button>
          </div>

          {activeTab === 'inventory' ? (
            <>
              {/* Category Filter Chips */}
              <div className="warehouse-category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>

              <div className="inventory-table-card">
                <table className="inventory-data-table">
                  <thead>
                    <tr>
                      <th>{t('whThItem')}</th>
                      <th>{t('whThCategory')}</th>
                      <th>{t('whThAvailable')}</th>
                      <th>{t('whThReserved')}</th>
                      <th>{t('whThMinStock')}</th>
                      <th>{t('whThStatus')}</th>
                      <th>{t('whThExpiry')}</th>
                      <th>{t('whThWarehouse')}</th>
                      <th>{t('whThLastCount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No items in this category.</td></tr>
                    )}
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="item-name-text">{item.name}</div>
                          <div className="item-sku-text">#{item.sku}</div>
                        </td>
                        <td><span className="cat-plain-text">{item.category}</span></td>
                        <td>
                          <span className="count-num-bold">{item.availableCount.toLocaleString()}</span>{' '}
                          <span className="count-unit-sub">{item.unit}</span>
                        </td>
                        <td><span className="count-num-plain">{item.reservedCount.toLocaleString()}</span></td>
                        <td><span className="count-num-plain">{item.minStockThreshold.toLocaleString()}</span></td>
                        <td><span className={`w-status-badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span></td>
                        <td>
                          {item.expiryDate ? (
                            <span className={expiresSoon(item) ? 'expiry-red-text' : 'count-date-text'}>{item.expiryDate}</span>
                          ) : (
                            <span className="expiry-dash">—</span>
                          )}
                        </td>
                        <td><span className="warehouse-location-text">{item.warehouseName}</span></td>
                        <td><span className="count-date-text">{item.lastCountDate}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
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
                  {movements.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No stock movements recorded yet.</td></tr>
                  )}
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{m.date}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          background: m.type === 'INBOUND' ? '#ecfdf5' : '#eff6ff',
                          color: m.type === 'INBOUND' ? '#059669' : '#2563eb'
                        }}>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{m.item}</td>
                      <td style={{ fontWeight: 700, color: m.type === 'INBOUND' ? '#059669' : '#dc2626' }}>{m.qty}</td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>{m.fromTo}</td>
                      <td>{m.ref ? <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{m.ref}</code> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receive / Dispatch Stock Modal */}
          {moveMode && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
              <div role="dialog" aria-modal="true" aria-labelledby="move-title" style={{ background: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 id="move-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {moveMode === 'receive' ? '📦 Receive Inbound Stock' : '🚚 Dispatch Stock'}
                  </h3>
                  <button onClick={() => setMoveMode(null)} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
                </div>
                <form onSubmit={handleMoveSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle} htmlFor="move-item">Item</label>
                    <select id="move-item" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} style={fieldStyle} required>
                      {allItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.warehouseName}) — in stock: {i.availableCount} {i.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle} htmlFor="move-qty">Quantity ({selectedItem?.unit || 'units'})</label>
                    <input id="move-qty" type="number" min="1" max={moveMode === 'dispatch' ? selectedItem?.availableCount : undefined}
                      value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={fieldStyle} required />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle} htmlFor="move-fromto">{moveMode === 'receive' ? 'Received from → into' : 'Sent from → to'}</label>
                    <input id="move-fromto" type="text" value={fromTo} onChange={(e) => setFromTo(e.target.value)}
                      placeholder={moveMode === 'receive' ? 'e.g. WFP donation → Sylhet Central Depot' : 'e.g. Sylhet Central → Tahirpur Shelter'} style={fieldStyle} required />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle} htmlFor="move-ref">Reference (optional)</label>
                    <input id="move-ref" type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. PO-8821, DON-4410 or a request tracking ID" style={fieldStyle} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setMoveMode(null)} style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving} style={{ padding: '9px 20px', borderRadius: '6px', border: 'none', background: moveMode === 'receive' ? '#059669' : '#1e40af', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>
                      {isSaving ? 'Saving…' : moveMode === 'receive' ? 'Confirm Intake' : 'Confirm Dispatch'}
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
