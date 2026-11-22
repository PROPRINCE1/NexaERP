import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react';
import {
  REFERENCE_TODAY,
  type ProductRecord,
  type TransactionRecord,
} from '../../data/erpSeedData';
import {
  buildTrendSeries,
  computeDashboardMetrics,
  formatPkr,
} from '../../utils/erpEngine';
import { ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';
import type { WorkspaceViewId } from './TopNavbar';

interface OverviewViewProps {
  products: ProductRecord[];
  transactions: TransactionRecord[];
  onNavigate: (view: WorkspaceViewId) => void;
  onSelectProductForInventory: (productId: string) => void;
  onSelectProductForForecast: (productId: string) => void;
}

export function OverviewView({
  products,
  transactions,
  onNavigate,
  onSelectProductForInventory,
  onSelectProductForForecast,
}: OverviewViewProps) {
  const [lookbackDays, setLookbackDays] = useState<7 | 30 | 90>(30);
  const [chartMode, setChartMode] = useState<'both' | 'sales'>('both');
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const metrics = useMemo(
    () => computeDashboardMetrics(products, transactions, REFERENCE_TODAY, lookbackDays),
    [products, transactions, lookbackDays],
  );

  const chartDays = lookbackDays === 7 ? 7 : lookbackDays === 30 ? 21 : 30;
  const series = useMemo(
    () => buildTrendSeries(transactions, REFERENCE_TODAY, chartDays),
    [transactions, chartDays],
  );

  const maxPkr = useMemo(() => {
    const peak = Math.max(
      1,
      ...series.map((d) =>
        chartMode === 'sales' ? d.salesPkr : Math.max(d.salesPkr, d.purchasesPkr),
      ),
    );
    return peak * 1.15;
  }, [series, chartMode]);

  const activeDay =
    hoveredDayIdx !== null && series[hoveredDayIdx]
      ? series[hoveredDayIdx]
      : series[series.length - 1];

  return (
    <div className="space-y-6">
      {/* Header row with reactive segmented date window */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#075e58]">Operations summary</p>
          <h1 className="mt-0.5 text-2xl sm:text-[28px] font-bold tracking-[-0.03em] text-[#102d40]">
            Owner overview
          </h1>
          <p className="mt-1 text-sm text-[#395157]">
            Daily and periodic summary across sales, purchases, stock value proxy, and alerts.
          </p>
        </div>

        <div
          role="group"
          aria-label="Dashboard date window"
          className="inline-flex items-center gap-1 self-start rounded-[5px] border border-[#b5cbc0] bg-[#e0ece5] p-1"
        >
          {([7, 30, 90] as const).map((days) => {
            const active = lookbackDays === days;
            return (
              <motion.button
                key={days}
                type="button"
                aria-pressed={active}
                whileTap={{ scale: 0.96 }}
                onClick={() => setLookbackDays(days)}
                className={`relative min-h-[34px] rounded-[4px] px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="overview-window-pill"
                    transition={SPRING_TACTILE}
                    className="absolute inset-0 rounded-[4px] bg-[#102d40]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">Last {days} days</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4 KPI Summary Blocks (soft matte sage-mint surface, zero white glare) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          whileHover={{ y: -2 }}
          transition={SPRING_TACTILE}
          className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#445e62]">
            <span>Sales ({lookbackDays}d)</span>
            <span className="font-mono tabular-nums">{metrics.salesCount} txns</span>
          </div>
          <p className="mt-2 font-mono text-xl font-bold tracking-tight text-[#102d40] tabular-nums whitespace-nowrap">
            {formatPkr(metrics.salesTotalPkr)}
          </p>
          <p className="mt-1.5 text-xs text-[#4f676a]">
            Sum of quantity × unit price for recorded sales
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={SPRING_TACTILE}
          className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#445e62]">
            <span>Purchases ({lookbackDays}d)</span>
            <span className="font-mono tabular-nums">{metrics.purchasesCount} receipts</span>
          </div>
          <p className="mt-2 font-mono text-xl font-bold tracking-tight text-[#102d40] tabular-nums whitespace-nowrap">
            {formatPkr(metrics.purchasesTotalPkr)}
          </p>
          <p className="mt-1.5 text-xs text-[#4f676a]">
            Supplier stock receipts recorded in window
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={SPRING_TACTILE}
          className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#445e62]">
            <span>Stock value proxy</span>
            <span className="font-mono tabular-nums">{products.length} SKUs</span>
          </div>
          <p className="mt-2 font-mono text-xl font-bold tracking-tight text-[#102d40] tabular-nums whitespace-nowrap">
            {formatPkr(metrics.stockValueProxyPkr)}
          </p>
          <p className="mt-1.5 text-xs text-[#4f676a]">
            Current on-hand units × latest unit cost
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={SPRING_TACTILE}
          className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#445e62]">
            <span>Attention queue</span>
            <span className="font-mono tabular-nums">Human review</span>
          </div>
          <p className="mt-2 font-mono text-lg sm:text-xl font-bold tracking-tight text-[#8d5f1d] tabular-nums whitespace-nowrap">
            {metrics.lowStockProducts.length} low · {metrics.flaggedTransactions.length} flagged
          </p>
          <p className="mt-1.5 text-xs text-[#4f676a]">
            Below min threshold or pending quality check
          </p>
        </motion.div>
      </div>

      {/* Main split: Sales & Purchases Trend Chart + Suggested Review Queue */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Trend Chart Card */}
        <section
          aria-labelledby="trend-chart-heading"
          className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-2.5 border-b border-[#c9dbd2] pb-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="trend-chart-heading"
                className="text-base font-bold tracking-tight text-[#102d40]"
              >
                {chartMode === 'sales' ? 'Daily sales trend' : 'Sales vs. purchases trend'}
              </h2>
              <p className="text-xs text-[#445e62]">
                Last {chartDays} days ending {REFERENCE_TODAY} · Hover bars to inspect totals
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Chart series mode"
                className="inline-flex items-center gap-1 rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] p-0.5"
              >
                {(['both', 'sales'] as const).map((mode) => {
                  const active = chartMode === mode;
                  return (
                    <motion.button
                      key={mode}
                      type="button"
                      aria-pressed={active}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setChartMode(mode)}
                      className={`relative min-h-[28px] rounded-[3px] px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer ${
                        active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="chart-mode-pill"
                          transition={SPRING_TACTILE}
                          className="absolute inset-0 rounded-[3px] bg-[#087c72]"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10">
                        {mode === 'both' ? 'Both' : 'Sales only'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#395157]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 bg-[#087c72]" aria-hidden="true" />
                  Sales
                </span>
                {chartMode === 'both' && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 bg-[#102d40]/40" aria-hidden="true" />
                    Purchases
                  </span>
                )}
              </div>
            </div>
          </div>

          {activeDay && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#c5d8ce] bg-[#e0ece5] px-3.5 py-2 text-xs">
              <span className="font-mono font-bold text-[#102d40] tabular-nums">
                {activeDay.date}
              </span>
              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                <span className="text-[#075e58] font-semibold">
                  Sales: {formatPkr(activeDay.salesPkr)} ({activeDay.salesUnits} units)
                </span>
                <span className="text-[#395157]">
                  Purchases: {formatPkr(activeDay.purchasesPkr)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 w-full overflow-x-auto no-scrollbar">
            <svg
              viewBox="0 0 640 210"
              className="w-full min-w-[440px] h-[210px]"
              role="img"
              aria-label="Daily sales and purchases comparison chart"
            >
              {[0.25, 0.5, 0.75, 1].map((frac) => {
                const y = 175 - frac * 145;
                return (
                  <g key={frac}>
                    <line
                      x1="48"
                      y1={y}
                      x2="630"
                      y2={y}
                      stroke="#cbdcd3"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="42"
                      y={y + 3}
                      textAnchor="end"
                      className="fill-[#4e676a] font-mono text-[9px]"
                    >
                      {Math.round((maxPkr * frac) / 1000)}k
                    </text>
                  </g>
                );
              })}

              <line x1="48" y1="175" x2="630" y2="175" stroke="#a6beb2" />

              {series.map((pt, idx) => {
                const slotWidth = (630 - 54) / series.length;
                const xBase = 54 + idx * slotWidth;
                const barW = Math.max(4, Math.min(14, slotWidth * 0.34));
                const salesH = (pt.salesPkr / maxPkr) * 145;
                const purchH = (pt.purchasesPkr / maxPkr) * 145;
                const isSelected =
                  hoveredDayIdx === idx || (hoveredDayIdx === null && idx === series.length - 1);

                return (
                  <g
                    key={pt.date}
                    onMouseEnter={() => setHoveredDayIdx(idx)}
                    onFocus={() => setHoveredDayIdx(idx)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={xBase}
                      y={24}
                      width={slotWidth}
                      height={155}
                      fill={isSelected ? 'rgba(8, 124, 114, 0.1)' : 'transparent'}
                    />
                    <rect
                      x={xBase + slotWidth * 0.14}
                      y={175 - salesH}
                      width={barW}
                      height={Math.max(2, salesH)}
                      rx={1.5}
                      fill="#087c72"
                    />
                    {chartMode === 'both' && pt.purchasesPkr > 0 && (
                      <rect
                        x={xBase + slotWidth * 0.14 + barW + 2}
                        y={175 - purchH}
                        width={barW}
                        height={Math.max(2, purchH)}
                        rx={1.5}
                        fill="#102d40"
                        fillOpacity="0.45"
                      />
                    )}
                    {(idx === 0 ||
                      idx === series.length - 1 ||
                      idx % Math.ceil(series.length / 6) === 0) && (
                      <text
                        x={xBase + slotWidth / 2}
                        y="194"
                        textAnchor="middle"
                        className="fill-[#445e62] font-mono text-[9px]"
                      >
                        {pt.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Suggested Review Queue */}
        <section
          aria-labelledby="low-stock-queue-heading"
          className="flex flex-col justify-between rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
        >
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#c9dbd2] pb-3.5">
              <div>
                <h2
                  id="low-stock-queue-heading"
                  className="text-base font-bold tracking-tight text-[#102d40]"
                >
                  Suggested stock review
                </h2>
                <p className="text-xs text-[#445e62]">
                  {metrics.lowStockProducts.length}{' '}
                  {metrics.lowStockProducts.length === 1 ? 'product' : 'products'} below minimum threshold
                </p>
              </div>
              <ReactiveButton
                type="button"
                onClick={() => onNavigate('inventory')}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-2.5 py-1 text-xs font-semibold text-[#075e58] hover:bg-[#d3e4db] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open list</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </ReactiveButton>
            </div>

            {metrics.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-7 w-7 text-[#087c72] mb-2" />
                <p className="text-sm font-semibold text-[#102d40]">All tracked SKUs in range</p>
                <p className="mt-1 text-xs text-[#445e62]">
                  No products sit below their configured minimum-stock threshold.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#d1e0d8] mt-2">
                {metrics.lowStockProducts.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectProductForInventory(item.id)}
                        className="text-left text-xs font-bold text-[#102d40] hover:text-[#075e58] hover:underline truncate block cursor-pointer"
                      >
                        {item.name}
                      </button>
                      <p className="mt-0.5 font-mono text-[11px] text-[#445e62] tabular-nums">
                        On hand: {item.onHand} {item.unit} · Min: {item.minThreshold}
                      </p>
                    </div>
                    <ReactiveButton
                      type="button"
                      onClick={() => onSelectProductForForecast(item.id)}
                      className="min-h-[32px] rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-2.5 py-1 text-[11px] font-semibold text-[#075e58] hover:bg-[#d1e3da] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Review forecast
                    </ReactiveButton>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-3 border-t border-[#d1e0d8] pt-3 text-[11px] text-[#4f676a]">
            Threshold alerts are advisory. Staff confirm stock and supplier lead time before ordering.
          </p>
        </section>
      </div>

      {/* Data-Quality Warnings Panel */}
      <section
        aria-labelledby="data-quality-heading"
        className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#c9dbd2] pb-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#8d5f1d] shrink-0" />
            <div>
              <h2
                id="data-quality-heading"
                className="text-base font-bold tracking-tight text-[#102d40]"
              >
                Data-quality warnings
              </h2>
              <p className="text-xs text-[#445e62]">
                Automated checks surface missing prices or unverified slips without silently deleting records.
              </p>
            </div>
          </div>

          <ReactiveButton
            type="button"
            onClick={() => onNavigate('transactions')}
            className="inline-flex min-h-[36px] items-center gap-1.5 self-start rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:bg-[#d1e3da] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PackageCheck className="h-3.5 w-3.5 text-[#087c72]" />
            <span>Inspect in transactions</span>
          </ReactiveButton>
        </div>

        {metrics.flaggedTransactions.length === 0 ? (
          <p className="py-4 text-xs text-[#075e58] font-semibold">
            No unresolved data-quality flags in the active organization ledger.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-[#d1e0d8]">
            {metrics.flaggedTransactions.map((txn) => {
              const prod = products.find((p) => p.id === txn.productId);
              return (
                <div
                  key={txn.id}
                  className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-xs">
                    <span className="font-mono font-bold text-[#102d40] mr-2">
                      {txn.txnCode}
                    </span>
                    <span className="font-semibold text-[#8d5f1d] mr-2">Flagged</span>
                    <span className="text-[#395157]">
                      {prod?.name ?? txn.productId} ({txn.date}) — {txn.qualityIssue}
                    </span>
                  </div>
                  <ReactiveButton
                    type="button"
                    onClick={() => onNavigate('transactions')}
                    className="self-start sm:self-center text-xs font-semibold text-[#075e58] underline underline-offset-4 hover:text-[#102d40] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Resolve record
                  </ReactiveButton>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
