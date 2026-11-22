import type {
  ProductRecord,
  TransactionRecord,
  TransactionType,
} from '../data/erpSeedData';

export interface DashboardMetrics {
  salesTotalPkr: number;
  purchasesTotalPkr: number;
  salesCount: number;
  purchasesCount: number;
  stockValueProxyPkr: number;
  lowStockProducts: ProductRecord[];
  flaggedTransactions: TransactionRecord[];
}

export interface DailySeriesPoint {
  date: string;
  label: string;
  salesPkr: number;
  purchasesPkr: number;
  salesUnits: number;
}

export interface CsvValidationRowResult {
  rowNumber: number;
  rawLine: string;
  txnCode: string;
  date: string;
  type: string;
  sku: string;
  quantity: number | null;
  unitPricePkr: number | null;
  locationCode: string;
  note: string;
  isValid: boolean;
  errors: string[];
  resolvedProductId?: string;
}

export interface CsvValidationSummary {
  totalRows: number;
  validRows: CsvValidationRowResult[];
  invalidRows: CsvValidationRowResult[];
  validRatePercent: number;
}

export interface ForecastResult {
  eligible: boolean;
  ineligibleReason?: string;
  observationDays: number;
  historyStartDate: string;
  historyEndDate: string;
  recentStockoutDetected: boolean;
  horizonDays: number;
  seasonalNaiveUnits: number;
  adjustedForecastUnits: number;
  rangeLow: number;
  rangeHigh: number;
  suggestedReorderQty: number;
  baselineMae: number;
  modelMae: number;
  baselineWape: number;
  modelWape: number;
  wapeImprovementPct: number;
  explanation: string;
  dailySeries: {
    date: string;
    actualUnits: number | null;
    seasonalNaiveUnits: number;
    forecastUnits: number;
  }[];
}

export function formatPkr(amount: number): string {
  const rounded = Math.round(amount);
  return `PKR ${rounded.toLocaleString('en-PK')}`;
}

export function isLowStock(product: ProductRecord): boolean {
  return product.onHand < product.minThreshold;
}

function addDaysIso(baseIso: string, delta: number): string {
  const d = new Date(`${baseIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function computeDashboardMetrics(
  products: ProductRecord[],
  transactions: TransactionRecord[],
  referenceToday: string,
  lookbackDays: number,
): DashboardMetrics {
  const cutoff = addDaysIso(referenceToday, -(lookbackDays - 1));
  const inWindow = transactions.filter((t) => t.date >= cutoff && t.date <= referenceToday);

  let salesTotalPkr = 0;
  let purchasesTotalPkr = 0;
  let salesCount = 0;
  let purchasesCount = 0;

  for (const txn of inWindow) {
    if (txn.type === 'sale') {
      salesTotalPkr += txn.quantity * txn.unitPricePkr;
      salesCount += 1;
    } else if (txn.type === 'purchase') {
      purchasesTotalPkr += txn.quantity * txn.unitPricePkr;
      purchasesCount += 1;
    }
  }

  const stockValueProxyPkr = products.reduce(
    (sum, p) => sum + Math.max(0, p.onHand) * p.unitCostPkr,
    0,
  );

  const lowStockProducts = products
    .filter((p) => isLowStock(p))
    .sort((a, b) => a.onHand - a.minThreshold - (b.onHand - b.minThreshold));

  const flaggedTransactions = transactions.filter((t) => t.qualityStatus === 'flagged');

  return {
    salesTotalPkr,
    purchasesTotalPkr,
    salesCount,
    purchasesCount,
    stockValueProxyPkr,
    lowStockProducts,
    flaggedTransactions,
  };
}

export function buildTrendSeries(
  transactions: TransactionRecord[],
  referenceToday: string,
  days: number,
): DailySeriesPoint[] {
  const map = new Map<string, DailySeriesPoint>();

  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysIso(referenceToday, -i);
    map.set(date, {
      date,
      label: date.slice(5), // MM-DD
      salesPkr: 0,
      purchasesPkr: 0,
      salesUnits: 0,
    });
  }

  for (const txn of transactions) {
    const bucket = map.get(txn.date);
    if (!bucket) continue;
    if (txn.type === 'sale') {
      bucket.salesPkr += txn.quantity * txn.unitPricePkr;
      bucket.salesUnits += txn.quantity;
    } else if (txn.type === 'purchase') {
      bucket.purchasesPkr += txn.quantity * txn.unitPricePkr;
    }
  }

  return Array.from(map.values());
}

export function validateNewTransaction(
  input: {
    type: TransactionType;
    product: ProductRecord | undefined;
    quantity: number;
    unitPricePkr: number;
    date: string;
  },
): string[] {
  const errors: string[] = [];
  if (!input.product) {
    errors.push('Select a valid product.');
    return errors;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.push('Date must follow YYYY-MM-DD format.');
  }
  if (!Number.isFinite(input.quantity) || input.quantity === 0) {
    errors.push('Quantity must be a non-zero number.');
  }
  if (input.type !== 'adjustment' && input.quantity < 0) {
    errors.push('Sales and purchases require a positive quantity.');
  }
  if (input.type === 'sale' && input.quantity > input.product.onHand) {
    errors.push(
      `Insufficient stock: requested ${input.quantity} ${input.product.unit}, only ${input.product.onHand} on hand.`,
    );
  }
  if (input.type === 'adjustment' && input.product.onHand + input.quantity < 0) {
    errors.push(
      `Adjustment would reduce stock below zero (current on hand: ${input.product.onHand}).`,
    );
  }
  if (!Number.isFinite(input.unitPricePkr) || input.unitPricePkr < 0) {
    errors.push('Unit price cannot be negative.');
  }
  return errors;
}

export function validateCsvBatch(
  csvText: string,
  products: ProductRecord[],
  existingTransactions: TransactionRecord[],
): CsvValidationSummary {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      validRatePercent: 0,
    };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const colIndex = (name: string) => header.indexOf(name);

  const idxTxn = colIndex('txn_code');
  const idxDate = colIndex('date');
  const idxType = colIndex('type');
  const idxSku = colIndex('sku');
  const idxQty = colIndex('quantity');
  const idxPrice = colIndex('unit_price_pkr');
  const idxLoc = colIndex('location_code');
  const idxNote = colIndex('note');

  const existingCodes = new Set(existingTransactions.map((t) => t.txnCode.toUpperCase()));
  const seenInBatch = new Set<string>();
  const skuMap = new Map(products.map((p) => [p.sku.toUpperCase(), p]));

  const validRows: CsvValidationRowResult[] = [];
  const invalidRows: CsvValidationRowResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(',').map((c) => c.trim());
    const errors: string[] = [];

    const txnCode = idxTxn >= 0 ? (cols[idxTxn] ?? '') : '';
    const date = idxDate >= 0 ? (cols[idxDate] ?? '') : '';
    const type = idxType >= 0 ? (cols[idxType] ?? '').toLowerCase() : '';
    const sku = idxSku >= 0 ? (cols[idxSku] ?? '').toUpperCase() : '';
    const rawQty = idxQty >= 0 ? (cols[idxQty] ?? '') : '';
    const rawPrice = idxPrice >= 0 ? (cols[idxPrice] ?? '') : '';
    const locationCode = idxLoc >= 0 ? (cols[idxLoc] ?? '') : '';
    const note = idxNote >= 0 ? (cols[idxNote] ?? '') : 'CSV batch import';

    if (!txnCode) {
      errors.push('Missing unique txn_code.');
    } else {
      const upperCode = txnCode.toUpperCase();
      if (existingCodes.has(upperCode)) {
        errors.push(`Duplicate txn_code "${txnCode}" already exists in ledger.`);
      } else if (seenInBatch.has(upperCode)) {
        errors.push(`Duplicate txn_code "${txnCode}" repeated inside CSV.`);
      }
      seenInBatch.add(upperCode);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Invalid date "${date}" (expected YYYY-MM-DD).`);
    } else {
      const parsed = new Date(`${date}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) {
        errors.push(`Calendar date "${date}" is invalid.`);
      }
    }

    if (type !== 'sale' && type !== 'purchase') {
      errors.push(`Unsupported type "${type || '(empty)'}" (allowed: sale, purchase).`);
    }

    const matchedProduct = skuMap.get(sku);
    if (!matchedProduct) {
      errors.push(`Unknown SKU "${sku || '(empty)'}" for active organization.`);
    }

    const quantity = rawQty === '' ? null : Number(rawQty);
    if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`Quantity "${rawQty}" must be a positive number.`);
    }

    const unitPricePkr = rawPrice === '' ? null : Number(rawPrice);
    if (unitPricePkr === null || !Number.isFinite(unitPricePkr) || unitPricePkr < 0) {
      errors.push(`Unit price "${rawPrice}" must be a non-negative number.`);
    }

    const rowResult: CsvValidationRowResult = {
      rowNumber: i + 1,
      rawLine,
      txnCode,
      date,
      type,
      sku,
      quantity,
      unitPricePkr,
      locationCode: locationCode || matchedProduct?.locationCode || 'MAIN',
      note,
      isValid: errors.length === 0,
      errors,
      resolvedProductId: matchedProduct?.id,
    };

    if (rowResult.isValid) {
      validRows.push(rowResult);
    } else {
      invalidRows.push(rowResult);
    }
  }

  const totalRows = validRows.length + invalidRows.length;
  const validRatePercent = totalRows > 0 ? Math.round((validRows.length / totalRows) * 100) : 0;

  return {
    totalRows,
    validRows,
    invalidRows,
    validRatePercent,
  };
}

/**
 * Computes an interpretable demand forecast with a seasonal-naive (7-day lag) baseline,
 * rolling-origin holdout WAPE/MAE comparison, uncertainty band, and human-review reorder suggestion.
 * Enforces data sufficiency check (>= 14 days of history).
 */
export function computeDemandForecast(
  product: ProductRecord,
  transactions: TransactionRecord[],
  referenceToday: string,
  horizonDays: number,
): ForecastResult {
  const productSales = transactions
    .filter((t) => t.productId === product.id && t.type === 'sale')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (productSales.length === 0) {
    return {
      eligible: false,
      ineligibleReason:
        'No historical sales records found for this item. Use manual minimum-stock threshold rules until at least 14 days of sales are recorded.',
      observationDays: 0,
      historyStartDate: referenceToday,
      historyEndDate: referenceToday,
      recentStockoutDetected: false,
      horizonDays,
      seasonalNaiveUnits: 0,
      adjustedForecastUnits: 0,
      rangeLow: 0,
      rangeHigh: 0,
      suggestedReorderQty: Math.max(0, product.minThreshold - product.onHand),
      baselineMae: 0,
      modelMae: 0,
      baselineWape: 0,
      modelWape: 0,
      wapeImprovementPct: 0,
      explanation: 'Insufficient history: threshold rule applies.',
      dailySeries: [],
    };
  }

  const firstDate = productSales[0].date;
  const msSpan =
    new Date(`${referenceToday}T00:00:00Z`).getTime() -
    new Date(`${firstDate}T00:00:00Z`).getTime();
  const observationDays = Math.max(1, Math.round(msSpan / 86400000) + 1);

  if (observationDays < 14) {
    return {
      eligible: false,
      ineligibleReason: `Sparse transaction history (${observationDays} days observed; minimum 14 days required for weekly seasonality). Using threshold rule only — no forecast presented.`,
      observationDays,
      historyStartDate: firstDate,
      historyEndDate: referenceToday,
      recentStockoutDetected: false,
      horizonDays,
      seasonalNaiveUnits: 0,
      adjustedForecastUnits: 0,
      rangeLow: 0,
      rangeHigh: 0,
      suggestedReorderQty: Math.max(0, product.minThreshold - product.onHand),
      baselineMae: 0,
      modelMae: 0,
      baselineWape: 0,
      modelWape: 0,
      wapeImprovementPct: 0,
      explanation:
        'Report Risk Control: items with sparse history display a data-sufficiency warning instead of a speculative forecast.',
      dailySeries: [],
    };
  }

  // Build dense daily demand array over observed span (up to 56 days)
  const windowDays = Math.min(56, observationDays);
  const dailyMap = new Map<string, number>();
  for (let i = windowDays - 1; i >= 0; i--) {
    dailyMap.set(addDaysIso(referenceToday, -i), 0);
  }
  for (const s of productSales) {
    if (dailyMap.has(s.date)) {
      dailyMap.set(s.date, (dailyMap.get(s.date) ?? 0) + s.quantity);
    }
  }

  const dates = Array.from(dailyMap.keys());
  const actuals = dates.map((d) => dailyMap.get(d) ?? 0);

  // Detect recent zero-sales days in last 10 days (potential stock-out signal)
  const last10 = actuals.slice(-10);
  const recentStockoutDetected = last10.some((v) => v === 0) || product.onHand === 0;

  // Rolling-origin holdout evaluation over the last 14 days:
  // Baseline: Seasonal-Naive (value 7 days prior)
  // Model: Weighted 4-week same-weekday average (weights: 0.45, 0.28, 0.17, 0.10)
  const evalDays = Math.min(14, Math.max(7, actuals.length - 14));
  const evalStart = actuals.length - evalDays;

  let baselineAbsErr = 0;
  let modelAbsErr = 0;
  let actualSum = 0;

  for (let i = evalStart; i < actuals.length; i++) {
    const actual = actuals[i];
    const naivePred = i >= 7 ? actuals[i - 7] : actuals[0];

    // Weighted same-weekday average across up to 4 prior weeks
    const weights = [0.45, 0.28, 0.17, 0.1];
    let wSum = 0;
    let vSum = 0;
    for (let w = 1; w <= 4; w++) {
      const idx = i - w * 7;
      if (idx >= 0) {
        const wt = weights[w - 1];
        wSum += wt;
        vSum += wt * actuals[idx];
      }
    }
    const modelPred = wSum > 0 ? vSum / wSum : naivePred;

    baselineAbsErr += Math.abs(actual - naivePred);
    modelAbsErr += Math.abs(actual - modelPred);
    actualSum += actual;
  }

  const baselineMae = Number((baselineAbsErr / evalDays).toFixed(2));
  const modelMae = Number((modelAbsErr / evalDays).toFixed(2));
  const denom = Math.max(1, actualSum);
  const baselineWape = Number(((baselineAbsErr / denom) * 100).toFixed(1));
  const modelWape = Number(((modelAbsErr / denom) * 100).toFixed(1));
  const wapeImprovementPct =
    baselineWape > 0
      ? Number((((baselineWape - modelWape) / baselineWape) * 100).toFixed(1))
      : 0;

  // Generate horizon forecast
  let seasonalNaiveUnits = 0;
  let adjustedForecastUnits = 0;
  const futurePoints: {
    date: string;
    actualUnits: number | null;
    seasonalNaiveUnits: number;
    forecastUnits: number;
  }[] = [];

  for (let h = 1; h <= horizonDays; h++) {
    const lag7Idx = actuals.length - 7 + ((h - 1) % 7);
    const naiveDay = actuals[Math.max(0, lag7Idx)] ?? 0;

    const weights = [0.45, 0.28, 0.17, 0.1];
    let wSum = 0;
    let vSum = 0;
    for (let w = 0; w < 4; w++) {
      const idx = actuals.length - 7 * (w + 1) + ((h - 1) % 7);
      if (idx >= 0 && idx < actuals.length) {
        // Ignore zero-demand stockout day in recent week if older weeks had sales
        const val = actuals[idx];
        if (val === 0 && w === 0 && recentStockoutDetected) continue;
        wSum += weights[w];
        vSum += weights[w] * val;
      }
    }
    const modelDay = wSum > 0 ? vSum / wSum : naiveDay;

    seasonalNaiveUnits += naiveDay;
    adjustedForecastUnits += modelDay;

    futurePoints.push({
      date: addDaysIso(referenceToday, h),
      actualUnits: null,
      seasonalNaiveUnits: Math.round(naiveDay),
      forecastUnits: Number(modelDay.toFixed(1)),
    });
  }

  const roundedNaive = Math.round(seasonalNaiveUnits);
  const roundedModel = Math.round(adjustedForecastUnits);

  // Uncertainty band derived from empirical MAE * sqrt(horizonDays)
  const uncertaintyHalfWidth = Math.max(
    2,
    Math.round(modelMae * Math.sqrt(horizonDays) * 1.15),
  );
  const rangeLow = Math.max(1, roundedModel - uncertaintyHalfWidth);
  const rangeHigh = roundedModel + uncertaintyHalfWidth;

  // Suggested reorder covers horizon demand + safety buffer (minThreshold) minus current onHand
  const leadDemand = Math.round((roundedModel / horizonDays) * product.leadTimeDays);
  const targetStock = roundedModel + Math.max(product.minThreshold, leadDemand);
  const suggestedReorderQty = Math.max(0, targetStock - product.onHand);

  const historySeries = dates.slice(-14).map((date, idx) => {
    const globalIdx = dates.length - 14 + idx;
    const actual = actuals[globalIdx];
    const naive = globalIdx >= 7 ? actuals[globalIdx - 7] : actual;
    return {
      date,
      actualUnits: actual,
      seasonalNaiveUnits: naive,
      forecastUnits: actual,
    };
  });

  const explanationParts = [
    `Computed across ${windowDays} observed days (${dates[0]} to ${referenceToday}) using a 4-week weighted weekday profile compared against a 7-day seasonal-naive baseline.`,
  ];
  if (recentStockoutDetected) {
    explanationParts.push(
      'Recent zero-sale days suggest a stock-out may have suppressed observed demand; zeroed recent days were down-weighted.',
    );
  }
  explanationParts.push(
    `Supplier lead time is ${product.leadTimeDays} days with current stock at ${product.onHand} ${product.unit} (min threshold: ${product.minThreshold}).`,
  );

  return {
    eligible: true,
    observationDays: windowDays,
    historyStartDate: dates[0],
    historyEndDate: referenceToday,
    recentStockoutDetected,
    horizonDays,
    seasonalNaiveUnits: roundedNaive,
    adjustedForecastUnits: roundedModel,
    rangeLow,
    rangeHigh,
    suggestedReorderQty,
    baselineMae,
    modelMae,
    baselineWape,
    modelWape,
    wapeImprovementPct,
    explanation: explanationParts.join(' '),
    dailySeries: [...historySeries, ...futurePoints],
  };
}

export function serializeToCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}
