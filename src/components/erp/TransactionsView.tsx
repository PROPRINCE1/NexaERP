import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  PlusCircle,
  Search,
  Upload,
} from 'lucide-react';
import {
  REFERENCE_TODAY,
  ROLES,
  SAMPLE_CSV_WITH_ERRORS,
  type ProductRecord,
  type TransactionRecord,
  type TransactionType,
  type UserRole,
} from '../../data/erpSeedData';
import {
  formatPkr,
  serializeToCsv,
  validateCsvBatch,
  type CsvValidationSummary,
} from '../../utils/erpEngine';
import { EASE_OUT_EXPO, ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';

type SubTabId = 'ledger' | 'entry' | 'csv' | 'quality';

const PAGE_SIZE = 10;

interface TransactionsViewProps {
  products: ProductRecord[];
  transactions: TransactionRecord[];
  activeRole: UserRole;
  onRecordTransaction: (input: {
    type: TransactionType;
    productId: string;
    quantity: number;
    unitPricePkr: number;
    date: string;
    referenceNote: string;
  }) => string | null;
  onImportValidCsvRows: (summary: CsvValidationSummary) => number;
  onResolveFlaggedTransaction: (txnId: string, updatedUnitPrice: number, note: string) => void;
}

export function TransactionsView({
  products,
  transactions,
  activeRole,
  onRecordTransaction,
  onImportValidCsvRows,
  onResolveFlaggedTransaction,
}: TransactionsViewProps) {
  const [subTab, setSubTab] = useState<SubTabId>('ledger');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [page, setPage] = useState(1);

  // Record entry form state
  const [entryType, setEntryType] = useState<'sale' | 'purchase'>('sale');
  const [entryProductId, setEntryProductId] = useState<string>(products[0]?.id ?? '');
  const [entryQty, setEntryQty] = useState<string>('2');
  const [entryPrice, setEntryPrice] = useState<string>(
    String(products[0]?.unitPricePkr ?? 0),
  );
  const [entryDate, setEntryDate] = useState<string>(REFERENCE_TODAY);
  const [entryNote, setEntryNote] = useState<string>('');
  const [entryFeedback, setEntryFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // CSV Import state
  const [csvText, setCsvText] = useState<string>('');
  const [csvSummary, setCsvSummary] = useState<CsvValidationSummary | null>(null);
  const [csvImportMsg, setCsvImportMsg] = useState<string | null>(null);

  // Flagged record repair drafts
  const [repairPrices, setRepairPrices] = useState<Record<string, string>>({});
  const [repairNotes, setRepairNotes] = useState<Record<string, string>>({});

  const canRecord = ROLES[activeRole].canRecordTransactions;

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const flaggedRows = useMemo(
    () => transactions.filter((t) => t.qualityStatus === 'flagged'),
    [transactions],
  );

  const filteredLedger = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (!q) return true;
        const prod = productMap.get(t.productId);
        return (
          t.txnCode.toLowerCase().includes(q) ||
          (prod?.name.toLowerCase().includes(q) ?? false) ||
          (prod?.sku.toLowerCase().includes(q) ?? false)
        );
      });
  }, [transactions, typeFilter, search, productMap]);

  const totalPages = Math.max(1, Math.ceil(filteredLedger.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedLedger = useMemo(
    () => filteredLedger.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredLedger, safePage],
  );

  const handleSelectEntryProduct = (pid: string, type: 'sale' | 'purchase') => {
    setEntryProductId(pid);
    const prod = productMap.get(pid);
    if (prod) {
      setEntryPrice(String(type === 'sale' ? prod.unitPricePkr : prod.unitCostPkr));
    }
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onRecordTransaction({
      type: entryType,
      productId: entryProductId,
      quantity: Number(entryQty),
      unitPricePkr: Number(entryPrice),
      date: entryDate,
      referenceNote:
        entryNote.trim() || `${entryType === 'sale' ? 'Counter sale' : 'Supplier receipt'}`,
    });
    if (err) {
      setEntryFeedback({ ok: false, msg: err });
      return;
    }
    setEntryFeedback({
      ok: true,
      msg: `${entryType === 'sale' ? 'Sale' : 'Purchase'} recorded and inventory stock updated.`,
    });
    setEntryNote('');
  };

  const runCsvValidation = (raw: string) => {
    setCsvText(raw);
    setCsvImportMsg(null);
    if (!raw.trim()) {
      setCsvSummary(null);
      return;
    }
    setCsvSummary(validateCsvBatch(raw, products, transactions));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        runCsvValidation(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const firstSku = products[0]?.sku ?? 'ALN-OIL-1L';
    const firstPrice = products[0]?.unitPricePkr ?? 6850;
    const firstLoc = products[0]?.locationCode ?? 'KHI-WH1';
    const template = serializeToCsv(
      ['txn_code', 'date', 'type', 'sku', 'quantity', 'unit_price_pkr', 'location_code', 'note'],
      [['TXN-9101', REFERENCE_TODAY, 'sale', firstSku, 4, firstPrice, firstLoc, 'Template sample sale']],
    );
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexaerp_transactions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCommitValidCsv = () => {
    if (!csvSummary || csvSummary.validRows.length === 0) return;
    const imported = onImportValidCsvRows(csvSummary);
    setCsvImportMsg(
      `Imported ${imported} valid rows into the ledger and updated inventory stock balances.`,
    );
    setCsvSummary(null);
    setCsvText('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#075e58]">Operational records</p>
          <h1 className="mt-0.5 text-2xl sm:text-[28px] font-bold tracking-[-0.03em] text-[#102d40]">
            Sales, purchasing & CSV import
          </h1>
          <p className="mt-1 text-sm text-[#395157]">
            Search operational transactions, record new entries, validate CSV batches, and repair flagged records.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Transaction workflows"
          className="inline-flex flex-wrap items-center gap-1 self-start rounded-[5px] border border-[#b5cbc0] bg-[#e0ece5] p-1"
        >
          {(
            [
              { id: 'ledger', label: `Ledger (${transactions.length})` },
              { id: 'entry', label: 'Record entry' },
              { id: 'csv', label: 'CSV import' },
              { id: 'quality', label: `Flagged (${flaggedRows.length})` },
            ] as const
          ).map((tab) => {
            const active = subTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSubTab(tab.id)}
                className={`relative min-h-[34px] rounded-[4px] px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="txn-subtab-pill"
                    transition={SPRING_TACTILE}
                    className="absolute inset-0 rounded-[4px] bg-[#102d40]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Sub-tab 1: Paginated Searchable Transactions Ledger */}
        {subTab === 'ledger' && (
          <motion.div
            key="ledger"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-[360px]">
                <label htmlFor="txn-search" className="sr-only">
                  Search transactions
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4e676a]" />
                <input
                  id="txn-search"
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search Txn ID, product, or SKU..."
                  className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] pl-9 pr-3 text-xs text-[#102d40] placeholder:text-[#587275]"
                />
              </div>

              <div
                role="group"
                aria-label="Filter transaction type"
                className="inline-flex items-center gap-1 self-start rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] p-1"
              >
                {(['all', 'sale', 'purchase', 'adjustment'] as const).map((t) => {
                  const active = typeFilter === t;
                  return (
                    <motion.button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTypeFilter(t);
                        setPage(1);
                      }}
                      className={`relative min-h-[32px] rounded-[3px] px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap shrink-0 cursor-pointer ${
                        active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="txn-type-pill"
                          transition={SPRING_TACTILE}
                          className="absolute inset-0 rounded-[3px] bg-[#087c72]"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10">{t === 'all' ? 'All types' : t}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee]">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#c5d8ce] bg-[#e0ece5] text-[11px] font-semibold text-[#445e62]">
                      <th scope="col" className="py-3 pl-4 pr-3">Date / Txn</th>
                      <th scope="col" className="py-3 px-3">Type</th>
                      <th scope="col" className="py-3 px-3">Product</th>
                      <th scope="col" className="py-3 px-3 text-right">Qty</th>
                      <th scope="col" className="py-3 px-3 text-right hidden md:table-cell">Unit PKR</th>
                      <th scope="col" className="py-3 px-3 text-right">Total PKR</th>
                      <th scope="col" className="py-3 pl-3 pr-4 text-right">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d1e0d8] text-xs">
                    {pagedLedger.map((txn) => {
                      const prod = productMap.get(txn.productId);
                      const total = Math.abs(txn.quantity) * txn.unitPricePkr;
                      return (
                        <tr key={txn.id} className="hover:bg-[#e2ede7] transition-colors">
                          <td className="py-2.5 pl-4 pr-3 whitespace-nowrap">
                            <span className="font-mono font-semibold text-[#102d40] block tabular-nums">
                              {txn.txnCode}
                            </span>
                            <span className="font-mono text-[11px] text-[#4f676a] tabular-nums">
                              {txn.date}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 capitalize font-semibold text-[#395157]">
                            {txn.type}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-[#102d40] block">
                              {prod?.name ?? txn.productId}
                            </span>
                            <span className="text-[11px] text-[#4f676a]">{txn.referenceNote}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            {txn.quantity} {prod?.unit ?? ''}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap hidden md:table-cell">
                            {formatPkr(txn.unitPricePkr)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#102d40] tabular-nums whitespace-nowrap">
                            {formatPkr(total)}
                          </td>
                          <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap">
                            {txn.qualityStatus === 'flagged' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#8d5f1d]">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>Flagged</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#075e58]">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Verified</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modern Pagination Footer replacing scrollbars */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c5d8ce] bg-[#e0ece5] px-4 py-2.5 text-xs">
                <span className="font-mono text-[11px] text-[#395157] tabular-nums">
                  Showing {(safePage - 1) * PAGE_SIZE + (pagedLedger.length > 0 ? 1 : 0)}–
                  {(safePage - 1) * PAGE_SIZE + pagedLedger.length} of {filteredLedger.length} records
                </span>
                <div className="flex items-center gap-2">
                  <ReactiveButton
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-[4px] border border-[#b3c9be] bg-[#ebf3ee] px-2.5 py-1 text-xs font-semibold text-[#102d40] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </ReactiveButton>
                  <span className="font-mono text-[11px] font-bold text-[#102d40] tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <ReactiveButton
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-[4px] border border-[#b3c9be] bg-[#ebf3ee] px-2.5 py-1 text-xs font-semibold text-[#102d40] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </ReactiveButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-tab 2: Record Sale or Purchase Entry */}
        {subTab === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="max-w-[680px] rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-[#c9dbd2] pb-3.5">
              <PlusCircle className="h-4 w-4 text-[#087c72]" />
              <h2 className="text-base font-bold text-[#102d40]">
                Record sales or purchase transaction
              </h2>
            </div>

            {!canRecord && (
              <p className="mt-4 rounded-[4px] border border-[#d6c39c] bg-[#f1eadc] px-3.5 py-2.5 text-xs text-[#614518]">
                Active role <strong className="font-semibold">{ROLES[activeRole].label}</strong> has read-only ledger access. Switch to{' '}
                <strong className="font-semibold">Sales / Accounts Staff</strong> or{' '}
                <strong className="font-semibold">Administrator</strong> in the top bar to submit transactions.
              </p>
            )}

            <form onSubmit={handleSubmitEntry} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="entry-type" className="block font-semibold text-[#102d40] mb-1">
                    Transaction type
                  </label>
                  <select
                    id="entry-type"
                    disabled={!canRecord}
                    value={entryType}
                    onChange={(e) => {
                      const t = e.target.value as 'sale' | 'purchase';
                      setEntryType(t);
                      handleSelectEntryProduct(entryProductId, t);
                    }}
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 font-semibold text-[#102d40]"
                  >
                    <option value="sale">Sale (deducts stock)</option>
                    <option value="purchase">Purchase receipt (adds stock)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="entry-date" className="block font-semibold text-[#102d40] mb-1">
                    Transaction date
                  </label>
                  <input
                    id="entry-date"
                    type="date"
                    disabled={!canRecord}
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 font-mono text-[#102d40]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="entry-product" className="block font-semibold text-[#102d40] mb-1">
                    Product
                  </label>
                  <select
                    id="entry-product"
                    disabled={!canRecord}
                    value={entryProductId}
                    onChange={(e) => handleSelectEntryProduct(e.target.value, entryType)}
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 font-semibold text-[#102d40]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — On hand: {p.onHand} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="entry-qty" className="block font-semibold text-[#102d40] mb-1">
                    Quantity
                  </label>
                  <input
                    id="entry-qty"
                    type="number"
                    min={1}
                    disabled={!canRecord}
                    value={entryQty}
                    onChange={(e) => setEntryQty(e.target.value)}
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="entry-price" className="block font-semibold text-[#102d40] mb-1">
                    Unit price / cost (PKR)
                  </label>
                  <input
                    id="entry-price"
                    type="number"
                    min={0}
                    disabled={!canRecord}
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3 font-mono tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="entry-note" className="block font-semibold text-[#102d40] mb-1">
                    Invoice / reference note
                  </label>
                  <input
                    id="entry-note"
                    type="text"
                    disabled={!canRecord}
                    value={entryNote}
                    onChange={(e) => setEntryNote(e.target.value)}
                    placeholder="Optional counter slip or supplier invoice reference"
                    className="w-full min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-3"
                  />
                </div>
              </div>

              {entryFeedback && (
                <p
                  role="status"
                  className={`text-xs font-semibold ${
                    entryFeedback.ok ? 'text-[#075e58]' : 'text-[#b42318]'
                  }`}
                >
                  {entryFeedback.msg}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-[#c9dbd2] pt-4">
                <span className="font-mono text-xs font-bold text-[#102d40] tabular-nums">
                  Estimated total: {formatPkr((Number(entryQty) || 0) * (Number(entryPrice) || 0))}
                </span>
                <ReactiveButton
                  type="submit"
                  disabled={!canRecord}
                  className="min-h-[40px] rounded-[4px] bg-[#087c72] px-4 py-2 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
                >
                  Save transaction
                </ReactiveButton>
              </div>
            </form>
          </motion.div>
        )}

        {/* Sub-tab 3: Validated CSV Import Workbench */}
        {subTab === 'csv' && (
          <motion.div
            key="csv"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="space-y-4"
          >
            <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#c9dbd2] pb-3.5">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[#087c72]" />
                  <div>
                    <h2 className="text-base font-bold text-[#102d40]">Validated CSV import</h2>
                    <p className="text-xs text-[#445e62]">
                      Checks date format (YYYY-MM-DD), positive quantities, unique txn_code, and SKU integrity.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ReactiveButton
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:bg-[#d1e3da] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download template</span>
                  </ReactiveButton>
                  <ReactiveButton
                    type="button"
                    onClick={() => runCsvValidation(SAMPLE_CSV_WITH_ERRORS)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-[#087c72] bg-[#d6eae1] px-3 py-1.5 text-xs font-semibold text-[#075e58] hover:bg-[#c5e2d5] cursor-pointer"
                  >
                    <span>Load sample CSV (with test errors)</span>
                  </ReactiveButton>
                </div>
              </div>

              {!canRecord && (
                <p className="rounded-[4px] border border-[#d6c39c] bg-[#f1eadc] px-3.5 py-2.5 text-xs text-[#614518]">
                  You can preview CSV validation diagnostics below, and switch to{' '}
                  <strong className="font-semibold">Sales / Accounts Staff</strong> or{' '}
                  <strong className="font-semibold">Administrator</strong> to commit valid rows.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
                <label
                  htmlFor="csv-file-upload"
                  className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[4px] border border-dashed border-[#82a898] bg-[#e0ece5] p-4 text-center transition-colors hover:bg-[#d6e6dd]"
                >
                  <Upload className="h-5 w-5 text-[#087c72] mb-1.5" />
                  <span className="text-xs font-semibold text-[#102d40]">
                    Choose a CSV file from your computer
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#4f676a]">
                    Required columns: txn_code, date, type, sku, quantity, unit_price_pkr
                  </span>
                  <input
                    id="csv-file-upload"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>

                <div>
                  <label
                    htmlFor="csv-raw-editor"
                    className="block text-xs font-semibold text-[#102d40] mb-1"
                  >
                    CSV payload preview / inline editor
                  </label>
                  <textarea
                    id="csv-raw-editor"
                    rows={9}
                    value={csvText}
                    onChange={(e) => runCsvValidation(e.target.value)}
                    placeholder="Paste CSV rows here or click 'Load sample CSV (with test errors)' above..."
                    className="w-full no-scrollbar rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] p-2.5 font-mono text-[11px] text-[#102d40]"
                  />
                </div>
              </div>

              {csvImportMsg && (
                <p
                  role="status"
                  className="rounded-[4px] border border-[#8ec2ae] bg-[#d6eae1] px-3.5 py-2.5 text-xs font-semibold text-[#075e58]"
                >
                  {csvImportMsg}
                </p>
              )}

              {csvSummary && (
                <div className="border-t border-[#c9dbd2] pt-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#102d40]">
                        Total rows: {csvSummary.totalRows}
                      </span>
                      <span className="font-bold text-[#075e58]">
                        Valid: {csvSummary.validRows.length} ({csvSummary.validRatePercent}%)
                      </span>
                      <span className="font-bold text-[#b42318]">
                        Rejected: {csvSummary.invalidRows.length}
                      </span>
                    </div>

                    <ReactiveButton
                      type="button"
                      disabled={!canRecord || csvSummary.validRows.length === 0}
                      onClick={handleCommitValidCsv}
                      className="min-h-[38px] rounded-[4px] bg-[#087c72] px-4 py-1.5 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
                    >
                      Import {csvSummary.validRows.length} valid rows
                    </ReactiveButton>
                  </div>

                  {csvSummary.invalidRows.length > 0 && (
                    <div className="rounded-[4px] border border-[#d6b3b0] bg-[#f2e6e5] p-3.5 space-y-2">
                      <h3 className="text-xs font-bold text-[#912018]">
                        Actionable error diagnostics (invalid rows excluded from import)
                      </h3>
                      <ul className="space-y-1.5 text-xs text-[#7a271a]">
                        {csvSummary.invalidRows.map((row) => (
                          <li key={row.rowNumber} className="font-mono text-[11px]">
                            <strong>Row {row.rowNumber}</strong> ({row.txnCode || 'no code'}):{' '}
                            {row.errors.join(' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sub-tab 4: Flagged Records Queue */}
        {subTab === 'quality' && (
          <motion.div
            key="quality"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-5 space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-[#102d40]">Flagged data-quality records</h2>
              <p className="text-xs text-[#445e62]">
                Flagged rows stay visible for human correction instead of being silently dropped.
              </p>
            </div>

            {flaggedRows.length === 0 ? (
              <p className="py-6 text-center text-xs font-semibold text-[#075e58]">
                All records are currently verified.
              </p>
            ) : (
              <div className="divide-y divide-[#d1e0d8]">
                {flaggedRows.map((txn) => {
                  const prod = productMap.get(txn.productId);
                  const draftPrice =
                    repairPrices[txn.id] ?? String(prod?.unitPricePkr ?? txn.unitPricePkr);
                  const draftNote = repairNotes[txn.id] ?? txn.referenceNote;
                  return (
                    <div key={txn.id} className="py-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-[#102d40] mr-2">
                            {txn.txnCode}
                          </span>
                          <span className="font-semibold text-[#102d40]">
                            {prod?.name ?? txn.productId}
                          </span>
                          <span className="text-[#445e62] ml-2">
                            ({txn.date} · Qty {txn.quantity})
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#8d5f1d]">
                          {txn.qualityIssue}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="number"
                          min={0}
                          aria-label={`Correct unit price for ${txn.txnCode}`}
                          disabled={!canRecord}
                          value={draftPrice}
                          onChange={(e) =>
                            setRepairPrices((prev) => ({ ...prev, [txn.id]: e.target.value }))
                          }
                          className="w-36 min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 font-mono text-xs"
                        />
                        <input
                          type="text"
                          aria-label={`Correct reference note for ${txn.txnCode}`}
                          disabled={!canRecord}
                          value={draftNote}
                          onChange={(e) =>
                            setRepairNotes((prev) => ({ ...prev, [txn.id]: e.target.value }))
                          }
                          className="flex-1 min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 text-xs"
                        />
                        <ReactiveButton
                          type="button"
                          disabled={!canRecord}
                          onClick={() =>
                            onResolveFlaggedTransaction(
                              txn.id,
                              Math.max(0, Number(draftPrice) || 0),
                              draftNote.trim() || 'Verified by staff',
                            )
                          }
                          className="min-h-[36px] rounded-[4px] bg-[#087c72] px-3.5 py-1.5 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
                        >
                          Resolve & verify
                        </ReactiveButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
