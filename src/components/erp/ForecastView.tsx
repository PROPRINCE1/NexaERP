import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
  XCircle,
} from 'lucide-react';
import {
  REFERENCE_TODAY,
  ROLES,
  type ForecastDecision,
  type ProductRecord,
  type TransactionRecord,
  type UserRole,
} from '../../data/erpSeedData';
import { computeDemandForecast } from '../../utils/erpEngine';
import { ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';

interface ForecastViewProps {
  products: ProductRecord[];
  transactions: TransactionRecord[];
  activeRole: UserRole;
  selectedProductId: string;
  onSelectProductId: (id: string) => void;
  decisions: Record<string, ForecastDecision>;
  onDecideForecast: (
    productId: string,
    status: 'accepted' | 'dismissed',
    suggestedQty: number,
    horizonDays: number,
    note: string,
  ) => void;
  onSeeHistory: (productId: string) => void;
}

export function ForecastView({
  products,
  transactions,
  activeRole,
  selectedProductId,
  onSelectProductId,
  decisions,
  onDecideForecast,
  onSeeHistory,
}: ForecastViewProps) {
  const [horizonDays, setHorizonDays] = useState<7 | 14 | 28>(14);
  const [decisionNote, setDecisionNote] = useState('');

  const canApprove = ROLES[activeRole].canApproveForecasts;

  const activeProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId],
  );

  const forecast = useMemo(() => {
    if (!activeProduct) return null;
    return computeDemandForecast(activeProduct, transactions, REFERENCE_TODAY, horizonDays);
  }, [activeProduct, transactions, horizonDays]);

  const currentDecision = activeProduct ? decisions[activeProduct.id] : undefined;

  if (!activeProduct || !forecast) {
    return (
      <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-8 text-center text-sm text-[#445e62]">
        No products available for forecast evaluation in this organization.
      </div>
    );
  }

  const series = forecast.dailySeries;
  const maxUnits = Math.max(
    5,
    ...series.map((d) => Math.max(d.actualUnits ?? 0, d.seasonalNaiveUnits, d.forecastUnits)),
  );
  const svgW = 640;
  const svgH = 195;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const xAt = (idx: number) =>
    series.length <= 1 ? padL : padL + (idx / (series.length - 1)) * plotW;
  const yAt = (val: number) => padT + plotH - (val / (maxUnits * 1.15)) * plotH;

  const actualPoints = series
    .map((d, i) => (d.actualUnits !== null ? `${xAt(i)},${yAt(d.actualUnits)}` : null))
    .filter((v): v is string => v !== null)
    .join(' ');

  const naivePoints = series
    .map((d, i) => `${xAt(i)},${yAt(d.seasonalNaiveUnits)}`)
    .join(' ');

  const forecastPoints = series
    .map((d, i) => (d.actualUnits === null || i === 13 ? `${xAt(i)},${yAt(d.forecastUnits)}` : null))
    .filter((v): v is string => v !== null)
    .join(' ');

  const splitX = series.length > 14 ? xAt(13.5) : svgW - padR;

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-wide text-[#075e58]">Demand baseline</p>
          <h1 className="mt-0.5 text-2xl sm:text-[28px] font-bold tracking-[-0.03em] text-[#102d40]">
            Demand forecast review
          </h1>
          <p className="mt-1 text-sm text-[#395157]">
            Interpretable forecasts compared against a 7-day seasonal-naive baseline with human-in-the-loop reorder approval.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <div>
            <label htmlFor="forecast-sku-select" className="sr-only">
              Select product to review
            </label>
            <select
              id="forecast-sku-select"
              value={activeProduct.id}
              onChange={(e) => {
                onSelectProductId(e.target.value);
                setDecisionNote('');
              }}
              className="min-h-[38px] rounded-[4px] border border-[#b5cbc0] bg-[#ebf3ee] px-3 py-1.5 text-xs font-semibold text-[#102d40] cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.onHand} {p.unit} on hand)
                </option>
              ))}
            </select>
          </div>

          <div
            role="group"
            aria-label="Forecast horizon"
            className="inline-flex items-center gap-1 rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] p-1"
          >
            {([7, 14, 28] as const).map((h) => {
              const active = horizonDays === h;
              return (
                <motion.button
                  key={h}
                  type="button"
                  aria-pressed={active}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHorizonDays(h)}
                  className={`relative min-h-[32px] rounded-[3px] px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-[#f2f8f5]' : 'text-[#395157] hover:text-[#102d40]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="forecast-horizon-pill"
                      transition={SPRING_TACTILE}
                      className="absolute inset-0 rounded-[3px] bg-[#102d40]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{h} days</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data-Sufficiency Guard (Risk Register p. 12) */}
      {!forecast.eligible ? (
        <div className="rounded-[5px] border border-[#d6c39c] bg-[#f1eadc] p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#8d5f1d] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-[#102d40]">
                Data-sufficiency warning — forecast withheld for {activeProduct.name}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#5c4924]">
                {forecast.ineligibleReason}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-[#decfa9] text-xs">
            <div>
              <span className="text-[#6f572a] block">Observed sales window</span>
              <strong className="font-mono text-[#102d40] tabular-nums">
                {forecast.observationDays} days ({forecast.historyStartDate} to {forecast.historyEndDate})
              </strong>
            </div>
            <div>
              <span className="text-[#6f572a] block">Fallback rule active</span>
              <strong className="font-mono text-[#102d40] tabular-nums">
                Min threshold: {activeProduct.minThreshold} {activeProduct.unit} (On hand: {activeProduct.onHand})
              </strong>
            </div>
            <div className="flex items-center sm:justify-end">
              <ReactiveButton
                type="button"
                onClick={() => onSeeHistory(activeProduct.id)}
                className="min-h-[36px] rounded-[4px] border border-[#c7b387] bg-[#ebf3ee] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:bg-[#dfece5] cursor-pointer"
              >
                Inspect item threshold
              </ReactiveButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Forecast Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4">
              <span className="text-xs font-semibold text-[#445e62] block">
                Forecast range ({horizonDays} days)
              </span>
              <strong className="mt-1.5 block font-mono text-xl font-bold text-[#102d40] tabular-nums">
                {forecast.rangeLow}–{forecast.rangeHigh} {activeProduct.unit}
              </strong>
              <span className="mt-1 block text-[11px] text-[#4f676a]">
                Point estimate: {forecast.adjustedForecastUnits} {activeProduct.unit}
              </span>
            </div>

            <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4">
              <span className="text-xs font-semibold text-[#445e62] block">
                Baseline: seasonal-naive
              </span>
              <strong className="mt-1.5 block font-mono text-xl font-bold text-[#102d40] tabular-nums">
                {forecast.seasonalNaiveUnits} {activeProduct.unit}
              </strong>
              <span className="mt-1 block text-[11px] text-[#4f676a]">
                7-day lag repeat across {horizonDays} days
              </span>
            </div>

            <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4">
              <span className="text-xs font-semibold text-[#445e62] block">
                Holdout WAPE vs baseline
              </span>
              <strong className="mt-1.5 block font-mono text-xl font-bold text-[#075e58] tabular-nums">
                {forecast.modelWape}% vs {forecast.baselineWape}%
              </strong>
              <span className="mt-1 block text-[11px] text-[#4f676a]">
                {forecast.wapeImprovementPct >= 0
                  ? `${forecast.wapeImprovementPct}% relative WAPE reduction`
                  : 'Baseline matched or exceeded model on holdout'}
              </span>
            </div>

            <div className="rounded-[5px] border border-[#8ec2ae] bg-[#d6eae1] p-4">
              <span className="text-xs font-semibold text-[#075e58] block">
                Suggested reorder
              </span>
              <strong className="mt-1.5 block font-mono text-xl font-bold text-[#102d40] tabular-nums">
                {forecast.suggestedReorderQty} {activeProduct.unit}
              </strong>
              <span className="mt-1 block text-[11px] text-[#354f52]">
                Current stock: {activeProduct.onHand} · Lead: {activeProduct.leadTimeDays}d
              </span>
            </div>
          </div>

          {/* Chart + Holdout Metrics Split */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
            <section className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5">
              <div className="flex flex-col gap-2 border-b border-[#c9dbd2] pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#102d40]">
                    Historical sales & {horizonDays}-day forecast trajectory
                  </h2>
                  <p className="text-xs text-[#445e62]">
                    Source window: {forecast.historyStartDate} to {forecast.historyEndDate} ({forecast.observationDays} days)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#395157]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 bg-[#102d40]" aria-hidden="true" />
                    Actual
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 bg-[#087c72]" aria-hidden="true" />
                    Forecast
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#8d5f1d]" aria-hidden="true" />
                    Seasonal-naive
                  </span>
                </div>
              </div>

              <div className="mt-4 w-full overflow-x-auto no-scrollbar">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full min-w-[440px] h-[200px]"
                  role="img"
                  aria-label="Actual demand versus seasonal-naive baseline and forecast"
                >
                  {[0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = padT + plotH - frac * plotH;
                    const labelVal = Math.round(maxUnits * 1.15 * frac);
                    return (
                      <g key={frac}>
                        <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#cbdcd3" />
                        <text
                          x={padL - 6}
                          y={y + 3}
                          textAnchor="end"
                          className="fill-[#4e676a] font-mono text-[9px]"
                        >
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={splitX}
                    y1={padT}
                    x2={splitX}
                    y2={padT + plotH}
                    stroke="#98b4a6"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={splitX + 6}
                    y={padT + 10}
                    className="fill-[#075e58] font-sans text-[10px] font-semibold"
                  >
                    Forecast horizon →
                  </text>

                  <polyline
                    fill="none"
                    stroke="#8d5f1d"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                    points={naivePoints}
                  />

                  {actualPoints && (
                    <polyline
                      fill="none"
                      stroke="#102d40"
                      strokeWidth="2.25"
                      points={actualPoints}
                    />
                  )}

                  {forecastPoints && (
                    <polyline
                      fill="none"
                      stroke="#087c72"
                      strokeWidth="2.5"
                      points={forecastPoints}
                    />
                  )}

                  <text x={padL} y={svgH - 6} className="fill-[#445e62] font-mono text-[9px]">
                    {series[0]?.date.slice(5)}
                  </text>
                  <text
                    x={splitX}
                    y={svgH - 6}
                    textAnchor="middle"
                    className="fill-[#102d40] font-mono text-[9px] font-bold"
                  >
                    {REFERENCE_TODAY.slice(5)}
                  </text>
                  <text
                    x={svgW - padR}
                    y={svgH - 6}
                    textAnchor="end"
                    className="fill-[#075e58] font-mono text-[9px]"
                  >
                    {series[series.length - 1]?.date.slice(5)}
                  </text>
                </svg>
              </div>
            </section>

            {/* Explanation, Holdout Table & Human Review Actions */}
            <section className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-[#c9dbd2] pb-3">
                  <h2 className="text-base font-bold text-[#102d40]">
                    Evidence & baseline comparison
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#395157]">
                    {forecast.explanation}
                  </p>
                </div>

                {forecast.recentStockoutDetected && (
                  <div className="flex items-start gap-2 rounded-[4px] border border-[#d6c39c] bg-[#f1eadc] p-3 text-xs text-[#614518]">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#8d5f1d]" />
                    <span>
                      Recent stock-out caveat: zero-sale days were observed in the last 10 days, which may understate true demand.
                    </span>
                  </div>
                )}

                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#c5d8ce] text-[11px] font-semibold text-[#445e62]">
                      <th scope="col" className="py-1.5 text-left">Evaluation metric</th>
                      <th scope="col" className="py-1.5 text-right">Seasonal-naive</th>
                      <th scope="col" className="py-1.5 text-right">Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d1e0d8] font-mono tabular-nums">
                    <tr>
                      <td className="py-2 font-sans text-[#395157]">Holdout MAE (units/day)</td>
                      <td className="py-2 text-right text-[#102d40]">{forecast.baselineMae}</td>
                      <td className="py-2 text-right font-bold text-[#075e58]">{forecast.modelMae}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-sans text-[#395157]">Holdout WAPE (%)</td>
                      <td className="py-2 text-right text-[#102d40]">{forecast.baselineWape}%</td>
                      <td className="py-2 text-right font-bold text-[#075e58]">{forecast.modelWape}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Human Review Decision Panel */}
              <div className="border-t border-[#c9dbd2] pt-4 space-y-3">
                {currentDecision && (
                  <div
                    role="status"
                    className={`flex items-center gap-2 rounded-[4px] border px-3 py-2 text-xs font-semibold ${
                      currentDecision.status === 'accepted'
                        ? 'border-[#8ec2ae] bg-[#d6eae1] text-[#075e58]'
                        : 'border-[#b7cdc2] bg-[#dfece5] text-[#395157]'
                    }`}
                  >
                    {currentDecision.status === 'accepted' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {currentDecision.status === 'accepted'
                        ? `Approved for PO draft (${currentDecision.suggestedQty} ${activeProduct.unit})`
                        : 'Suggestion dismissed'}
                      {currentDecision.decidedBy ? ` · by ${currentDecision.decidedBy}` : ''}
                    </span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="forecast-decision-note"
                    className="block text-[11px] font-semibold text-[#395157] mb-1"
                  >
                    Review note (recorded in audit trail)
                  </label>
                  <input
                    id="forecast-decision-note"
                    type="text"
                    disabled={!canApprove}
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="e.g., Confirmed supplier price & warehouse space"
                    className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#e0ece5] px-2.5 text-xs text-[#102d40]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <ReactiveButton
                    type="button"
                    disabled={!canApprove}
                    onClick={() =>
                      onDecideForecast(
                        activeProduct.id,
                        'accepted',
                        forecast.suggestedReorderQty,
                        horizonDays,
                        decisionNote.trim() ||
                          'Confirmed after reviewing lead time and current stock',
                      )
                    }
                    className="min-h-[38px] rounded-[4px] bg-[#087c72] px-3.5 py-1.5 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] cursor-pointer"
                  >
                    Accept suggestion
                  </ReactiveButton>
                  <ReactiveButton
                    type="button"
                    disabled={!canApprove}
                    onClick={() =>
                      onDecideForecast(
                        activeProduct.id,
                        'dismissed',
                        forecast.suggestedReorderQty,
                        horizonDays,
                        decisionNote.trim() || 'Dismissed by reviewer',
                      )
                    }
                    className="min-h-[38px] rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-3.5 py-1.5 text-xs font-semibold text-[#102d40] hover:bg-[#d1e3da] disabled:cursor-not-allowed disabled:text-[#667d7d] cursor-pointer"
                  >
                    Dismiss
                  </ReactiveButton>
                  <ReactiveButton
                    type="button"
                    onClick={() => onSeeHistory(activeProduct.id)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[4px] border border-[#b3c9be] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#075e58] hover:bg-[#d1e3da] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>See history</span>
                  </ReactiveButton>
                </div>

                <p className="text-[11px] italic text-[#4f676a]">
                  Suggestion only. Verify supplier lead time and current stock before ordering.
                  {!canApprove && ' (Switch to Owner or Admin role to approve.)'}
                </p>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
