import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  REFERENCE_TODAY,
  ROLES,
  type ProductRecord,
  type TransactionRecord,
  type UserRole,
} from '../../data/erpSeedData';
import { formatPkr, isLowStock } from '../../utils/erpEngine';
import { EASE_OUT_EXPO, ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';

interface InventoryViewProps {
  products: ProductRecord[];
  transactions: TransactionRecord[];
  activeRole: UserRole;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
  onAddProduct: (input: {
    sku: string;
    name: string;
    category: string;
    unit: string;
    onHand: number;
    minThreshold: number;
    unitCostPkr: number;
    unitPricePkr: number;
    leadTimeDays: number;
    locationCode: string;
  }) => string | null;
  onUpdateThreshold: (productId: string, newThreshold: number) => void;
  onRecordStockAdjustment: (input: {
    productId: string;
    deltaQty: number;
    note: string;
  }) => string | null;
  onJumpToForecast: (productId: string) => void;
}

export function InventoryView({
  products,
  transactions,
  activeRole,
  selectedProductId,
  onSelectProduct,
  onAddProduct,
  onUpdateThreshold,
  onRecordStockAdjustment,
  onJumpToForecast,
}: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);

  // Add product form state
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Staples');
  const [newUnit, setNewUnit] = useState('packs');
  const [newOnHand, setNewOnHand] = useState('20');
  const [newMin, setNewMin] = useState('10');
  const [newCost, setNewCost] = useState('500');
  const [newPrice, setNewPrice] = useState('620');
  const [newLead, setNewLead] = useState('3');
  const [newLoc, setNewLoc] = useState('KHI-WH1');
  const [addError, setAddError] = useState<string | null>(null);

  // Detail panel interactive state
  const [thresholdDraft, setThresholdDraft] = useState<string>('');
  const [thresholdFeedback, setThresholdFeedback] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<string>('');
  const [adjustMode, setAdjustMode] = useState<'receipt' | 'deduct'>('receipt');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [adjustFeedback, setAdjustFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const canModifyStock = ROLES[activeRole].canAdjustStock;

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const sales7dByProduct = useMemo(() => {
    const d = new Date(`${REFERENCE_TODAY}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 6);
    const cutoff = d.toISOString().slice(0, 10);
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === 'sale' && t.date >= cutoff) {
        map.set(t.productId, (map.get(t.productId) ?? 0) + t.quantity);
      }
    }
    return map;
  }, [transactions]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      const low = isLowStock(p);
      if (statusFilter === 'low' && !low) return false;
      if (statusFilter === 'ok' && low) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const selectedProductMovements = useMemo(() => {
    if (!selectedProduct) return [];
    return transactions
      .filter((t) => t.productId === selectedProduct.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedProduct, transactions]);

  const visibleMovements = showAllMovements
    ? selectedProductMovements.slice(0, 12)
    : selectedProductMovements.slice(0, 4);

  const openDetail = (p: ProductRecord) => {
    onSelectProduct(p.id);
    setThresholdDraft(String(p.minThreshold));
    setThresholdFeedback(null);
    setAdjustQty('');
    setAdjustNote('');
    setAdjustFeedback(null);
    setShowAllMovements(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onAddProduct({
      sku: newSku.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory.trim(),
      unit: newUnit.trim(),
      onHand: Number(newOnHand),
      minThreshold: Number(newMin),
      unitCostPkr: Number(newCost),
      unitPricePkr: Number(newPrice),
      leadTimeDays: Number(newLead),
      locationCode: newLoc.trim().toUpperCase(),
    });
    if (err) {
      setAddError(err);
      return;
    }
    setAddError(null);
    setNewSku('');
    setNewName('');
    setShowAddModal(false);
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const val = Number(thresholdDraft);
    if (!Number.isFinite(val) || val < 0) {
      setThresholdFeedback('Enter a non-negative threshold.');
      return;
    }
    onUpdateThreshold(selectedProduct.id, Math.round(val));
    setThresholdFeedback('Minimum threshold updated.');
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const raw = Number(adjustQty);
    if (!Number.isFinite(raw) || raw <= 0) {
      setAdjustFeedback({ ok: false, msg: 'Enter a positive adjustment quantity.' });
      return;
    }
    const delta = adjustMode === 'receipt' ? raw : -raw;
    const err = onRecordStockAdjustment({
      productId: selectedProduct.id,
      deltaQty: delta,
      note:
        adjustNote.trim() ||
        (adjustMode === 'receipt' ? 'Stock count receipt' : 'Damaged / stock write-off'),
    });
    if (err) {
      setAdjustFeedback({ ok: false, msg: err });
      return;
    }
    setAdjustQty('');
    setAdjustNote('');
    setAdjustFeedback({ ok: true, msg: 'Stock balance updated and logged.' });
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Primary Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#075e58]">Stock register</p>
          <h1 className="mt-0.5 text-2xl sm:text-[28px] font-bold tracking-[-0.03em] text-[#102d40]">
            Product & inventory register
          </h1>
          <p className="mt-1 text-sm text-[#395157]">
            Track on-hand quantities, minimum thresholds, movement logs, and stock adjustments.
          </p>
        </div>

        <ReactiveButton
          type="button"
          onClick={() => {
            setAddError(null);
            setShowAddModal(true);
          }}
          disabled={!canModifyStock}
          title={
            canModifyStock
              ? 'Add a new SKU'
              : 'Switch to Inventory Clerk or Administrator role to add products'
          }
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 self-start rounded-[4px] bg-[#087c72] px-4 py-2 text-xs font-semibold text-[#f3faf7] whitespace-nowrap shrink-0 hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add product</span>
        </ReactiveButton>
      </div>

      {!canModifyStock && (
        <p className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] px-4 py-2.5 text-xs text-[#395157]">
          Read-only inventory view for{' '}
          <strong className="text-[#102d40]">{ROLES[activeRole].label}</strong>. Switch to{' '}
          <strong className="text-[#102d40]">Inventory Clerk</strong> or{' '}
          <strong className="text-[#102d40]">Administrator</strong> in the top bar to add SKUs, edit thresholds, or adjust stock.
        </p>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-[340px]">
            <label htmlFor="inventory-search" className="sr-only">
              Search products
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4e676a]" />
            <input
              id="inventory-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] pl-9 pr-3 text-xs text-[#102d40] placeholder:text-[#587275]"
            />
          </div>

          <div>
            <label htmlFor="category-select" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter inventory by stock status"
          className="inline-flex items-center gap-1 self-start rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] p-1"
        >
          {(
            [
              { id: 'all', label: 'All items' },
              { id: 'low', label: 'Low stock' },
              { id: 'ok', label: 'In range' },
            ] as const
          ).map((opt) => {
            const active = statusFilter === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                aria-pressed={active}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(opt.id)}
                className={`relative min-h-[32px] rounded-[3px] px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="inventory-status-pill"
                    transition={SPRING_TACTILE}
                    className="absolute inset-0 rounded-[3px] bg-[#102d40]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content Split: Table + Optional Detail Panel */}
      <div className={`grid grid-cols-1 gap-5 ${selectedProduct ? 'xl:grid-cols-[1.35fr_1fr]' : ''}`}>
        {/* Inventory Data Grid */}
        <div className="overflow-hidden rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#c5d8ce] bg-[#e0ece5] text-[11px] font-semibold text-[#445e62]">
                  <th scope="col" className="py-3 pl-4 pr-3">Product</th>
                  <th scope="col" className="py-3 px-3 hidden sm:table-cell">SKU</th>
                  <th scope="col" className="py-3 px-3 text-right">On hand</th>
                  <th scope="col" className="py-3 px-3 text-right">Min</th>
                  <th scope="col" className="py-3 px-3 text-right hidden md:table-cell">7d sales</th>
                  <th scope="col" className="py-3 px-3">Status</th>
                  <th scope="col" className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1e0d8] text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-[#445e62]">
                      No products match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const low = isLowStock(p);
                    const sales7d = sales7dByProduct.get(p.id) ?? 0;
                    const active = selectedProduct?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          active ? 'bg-[#d6e9df]' : 'hover:bg-[#e2ede7]'
                        }`}
                      >
                        <td className="py-2.5 pl-4 pr-3">
                          <span className="font-semibold text-[#102d40] block">{p.name}</span>
                          <span className="text-[11px] text-[#4f676a]">
                            {p.category} · {p.locationCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#395157] whitespace-nowrap hidden sm:table-cell">
                          {p.sku}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#102d40] tabular-nums whitespace-nowrap">
                          {p.onHand} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#445e62] tabular-nums whitespace-nowrap">
                          {p.minThreshold}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#395157] tabular-nums whitespace-nowrap hidden md:table-cell">
                          {sales7d}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {low ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#8d5f1d]">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>Low stock</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#075e58]">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span>In range</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap">
                          <ReactiveButton
                            type="button"
                            onClick={() => openDetail(p)}
                            className={`min-h-[32px] rounded-[4px] border px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                              active
                                ? 'border-[#075e58] bg-[#087c72] text-[#f3faf7]'
                                : 'border-[#b3c9be] bg-[#dfece5] text-[#075e58] hover:bg-[#d1e3da]'
                            }`}
                          >
                            View
                          </ReactiveButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Item Detail & Adjustment Drawer (no internal scrollbar, clean Show-all expander) */}
        <AnimatePresence mode="wait">
          {selectedProduct && (
            <motion.aside
              key={selectedProduct.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              aria-label={`Item detail for ${selectedProduct.name}`}
              className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5 space-y-5 self-start"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#c9dbd2] pb-3.5">
                <div>
                  <p className="font-mono text-[11px] font-semibold text-[#075e58]">
                    {selectedProduct.sku} · {selectedProduct.locationCode}
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-[#102d40]">
                    {selectedProduct.name}
                  </h2>
                </div>
                <ReactiveButton
                  type="button"
                  onClick={() => onSelectProduct(null)}
                  aria-label="Close item detail"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#b3c9be] bg-[#dfece5] text-[#395157] hover:text-[#102d40] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </ReactiveButton>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-[4px] border border-[#c5d8ce] bg-[#e0ece5] p-3">
                  <span className="text-[#4f676a] block">On hand</span>
                  <strong className="mt-1 block font-mono text-base font-bold text-[#102d40] tabular-nums">
                    {selectedProduct.onHand} {selectedProduct.unit}
                  </strong>
                </div>
                <div className="rounded-[4px] border border-[#c5d8ce] bg-[#e0ece5] p-3">
                  <span className="text-[#4f676a] block">Supplier lead time</span>
                  <strong className="mt-1 block font-mono text-base font-bold text-[#102d40] tabular-nums">
                    {selectedProduct.leadTimeDays} days
                  </strong>
                </div>
                <div className="rounded-[4px] border border-[#c5d8ce] bg-[#e0ece5] p-3">
                  <span className="text-[#4f676a] block">Unit cost / price</span>
                  <strong className="mt-1 block font-mono text-xs font-bold text-[#102d40] tabular-nums">
                    {formatPkr(selectedProduct.unitCostPkr)} / {formatPkr(selectedProduct.unitPricePkr)}
                  </strong>
                </div>
                <div className="rounded-[4px] border border-[#c5d8ce] bg-[#e0ece5] p-3">
                  <span className="text-[#4f676a] block">Stock value proxy</span>
                  <strong className="mt-1 block font-mono text-xs font-bold text-[#102d40] tabular-nums">
                    {formatPkr(selectedProduct.onHand * selectedProduct.unitCostPkr)}
                  </strong>
                </div>
              </div>

              {/* Minimum Threshold Editor */}
              <form onSubmit={handleSaveThreshold} className="border-t border-[#d1e0d8] pt-4 space-y-2">
                <label
                  htmlFor="edit-min-threshold"
                  className="block text-xs font-bold text-[#102d40]"
                >
                  Minimum stock threshold ({selectedProduct.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-min-threshold"
                    type="number"
                    min={0}
                    disabled={!canModifyStock}
                    value={thresholdDraft}
                    onChange={(e) => setThresholdDraft(e.target.value)}
                    className="w-28 min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 py-1 font-mono text-xs text-[#102d40] tabular-nums disabled:opacity-60"
                  />
                  <ReactiveButton
                    type="submit"
                    disabled={!canModifyStock}
                    className="min-h-[36px] rounded-[4px] border border-[#075e58] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#075e58] hover:bg-[#d1e3da] disabled:cursor-not-allowed disabled:border-[#b5cbc0] disabled:text-[#667d7d] cursor-pointer"
                  >
                    Save threshold
                  </ReactiveButton>
                  <button
                    type="button"
                    onClick={() => onJumpToForecast(selectedProduct.id)}
                    className="ml-auto text-xs font-semibold text-[#075e58] underline underline-offset-4 hover:text-[#102d40] cursor-pointer"
                  >
                    Forecast view
                  </button>
                </div>
                {thresholdFeedback && (
                  <p className="text-[11px] font-semibold text-[#075e58]">{thresholdFeedback}</p>
                )}
              </form>

              {/* Stock Receipt / Adjustment Form */}
              <form
                onSubmit={handleStockAdjustment}
                className="border-t border-[#d1e0d8] pt-4 space-y-2.5"
              >
                <p className="text-xs font-bold text-[#102d40]">Record stock receipt or adjustment</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Adjustment direction"
                    disabled={!canModifyStock}
                    value={adjustMode}
                    onChange={(e) => setAdjustMode(e.target.value as 'receipt' | 'deduct')}
                    className="min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 text-xs text-[#102d40]"
                  >
                    <option value="receipt">Stock receipt (+)</option>
                    <option value="deduct">Write-off / deduct (-)</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    disabled={!canModifyStock}
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder={`Qty (${selectedProduct.unit})`}
                    aria-label="Adjustment quantity"
                    className="min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono text-xs text-[#102d40] tabular-nums"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={!canModifyStock}
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Slip reference or reason..."
                    aria-label="Adjustment reason"
                    className="flex-1 min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 text-xs text-[#102d40]"
                  />
                  <ReactiveButton
                    type="submit"
                    disabled={!canModifyStock}
                    className="min-h-[36px] rounded-[4px] bg-[#102d40] px-3 py-1.5 text-xs font-semibold text-[#f2f8f5] hover:bg-[#0a2232] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
                  >
                    Apply
                  </ReactiveButton>
                </div>
                {adjustFeedback && (
                  <p
                    className={`text-[11px] font-semibold ${
                      adjustFeedback.ok ? 'text-[#075e58]' : 'text-[#b42318]'
                    }`}
                  >
                    {adjustFeedback.msg}
                  </p>
                )}
              </form>

              {/* Movement History Log (modern Show all expander, zero inner scrollbar) */}
              <div className="border-t border-[#d1e0d8] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#102d40]">Recent stock movements</p>
                  {selectedProductMovements.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllMovements((prev) => !prev)}
                      className="text-[11px] font-semibold text-[#075e58] underline underline-offset-4 hover:text-[#102d40] cursor-pointer"
                    >
                      {showAllMovements ? 'Show fewer' : 'Show more'}
                    </button>
                  )}
                </div>
                {visibleMovements.length === 0 ? (
                  <p className="text-xs text-[#4f676a]">No movement history yet.</p>
                ) : (
                  <ul className="divide-y divide-[#d1e0d8] text-xs">
                    {visibleMovements.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] text-[#445e62] mr-2">
                            {m.date}
                          </span>
                          <span className="font-semibold text-[#102d40] capitalize">{m.type}</span>
                          <span className="block truncate text-[11px] text-[#4f676a]">
                            {m.referenceNote}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold tabular-nums shrink-0 ${
                            m.type === 'purchase' || (m.type === 'adjustment' && m.quantity > 0)
                              ? 'text-[#075e58]'
                              : 'text-[#102d40]'
                          }`}
                        >
                          {m.type === 'purchase'
                            ? `+${m.quantity}`
                            : m.type === 'sale'
                              ? `-${m.quantity}`
                              : m.quantity > 0
                                ? `+${m.quantity}`
                                : m.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-product-title"
        >
          <div
            className="fixed inset-0 bg-[#05141e]/60"
            onClick={() => setShowAddModal(false)}
            aria-hidden="true"
          />
          <form
            onSubmit={handleCreateProduct}
            className="relative z-10 w-full max-w-[500px] rounded-[6px] border border-[#b5cbc0] bg-[#ebf3ee] p-5 sm:p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#c9dbd2] pb-3">
              <h2 id="add-product-title" className="text-base font-bold text-[#102d40]">
                Add product to inventory register
              </h2>
              <ReactiveButton
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add product modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#b3c9be] bg-[#dfece5] text-[#395157] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </ReactiveButton>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label htmlFor="new-sku" className="block font-semibold text-[#102d40] mb-1">
                  SKU code
                </label>
                <input
                  id="new-sku"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="ALN-DAL-1K"
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-name" className="block font-semibold text-[#102d40] mb-1">
                  Product name
                </label>
                <input
                  id="new-name"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masoor daal, 1 kg"
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5"
                />
              </div>
              <div>
                <label htmlFor="new-cat" className="block font-semibold text-[#102d40] mb-1">
                  Category
                </label>
                <input
                  id="new-cat"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5"
                />
              </div>
              <div>
                <label htmlFor="new-unit" className="block font-semibold text-[#102d40] mb-1">
                  Unit
                </label>
                <input
                  id="new-unit"
                  required
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5"
                />
              </div>
              <div>
                <label htmlFor="new-onhand" className="block font-semibold text-[#102d40] mb-1">
                  Opening stock
                </label>
                <input
                  id="new-onhand"
                  type="number"
                  min={0}
                  required
                  value={newOnHand}
                  onChange={(e) => setNewOnHand(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-min" className="block font-semibold text-[#102d40] mb-1">
                  Min threshold
                </label>
                <input
                  id="new-min"
                  type="number"
                  min={0}
                  required
                  value={newMin}
                  onChange={(e) => setNewMin(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-cost" className="block font-semibold text-[#102d40] mb-1">
                  Unit cost (PKR)
                </label>
                <input
                  id="new-cost"
                  type="number"
                  min={0}
                  required
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-price" className="block font-semibold text-[#102d40] mb-1">
                  Selling price (PKR)
                </label>
                <input
                  id="new-price"
                  type="number"
                  min={0}
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-lead" className="block font-semibold text-[#102d40] mb-1">
                  Supplier lead (days)
                </label>
                <input
                  id="new-lead"
                  type="number"
                  min={1}
                  required
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-loc" className="block font-semibold text-[#102d40] mb-1">
                  Location code
                </label>
                <input
                  id="new-loc"
                  required
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono"
                />
              </div>
            </div>

            {addError && <p className="text-xs font-semibold text-[#b42318]">{addError}</p>}

            <div className="flex justify-end gap-2 border-t border-[#c9dbd2] pt-3">
              <ReactiveButton
                type="button"
                onClick={() => setShowAddModal(false)}
                className="min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-4 py-1.5 text-xs font-semibold text-[#395157] cursor-pointer"
              >
                Cancel
              </ReactiveButton>
              <ReactiveButton
                type="submit"
                className="min-h-[38px] rounded-[4px] bg-[#087c72] px-4 py-1.5 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] cursor-pointer"
              >
                Save product
              </ReactiveButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
