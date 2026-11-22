import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  REFERENCE_TODAY,
  SAMPLE_CSV_WITH_ERRORS,
} from '../data/erpSeedData';
import {
  buildTrendSeries,
  computeDashboardMetrics,
  computeDemandForecast,
  formatPkr,
  serializeToCsv,
  validateCsvBatch,
  validateNewTransaction,
} from './erpEngine';

const alNoorProducts = INITIAL_PRODUCTS.filter((p) => p.tenantId === 'alnoor-khi');
const alNoorTxns = INITIAL_TRANSACTIONS.filter((t) => t.tenantId === 'alnoor-khi');

test('computeDashboardMetrics calculates PKR totals, stock proxy, low-stock and flagged queues', () => {
  const metrics = computeDashboardMetrics(alNoorProducts, alNoorTxns, REFERENCE_TODAY, 30);
  assert.ok(metrics.salesTotalPkr > 0);
  assert.ok(metrics.purchasesTotalPkr > 0);
  assert.ok(metrics.stockValueProxyPkr > 0);
  assert.equal(metrics.lowStockProducts.length, 4); // oil, tea, flour, dates
  assert.equal(metrics.flaggedTransactions.length, 2);
  assert.equal(formatPkr(125400), 'PKR 125,400');
});

test('buildTrendSeries returns exact requested number of consecutive days', () => {
  const series = buildTrendSeries(alNoorTxns, REFERENCE_TODAY, 14);
  assert.equal(series.length, 14);
  assert.equal(series[13].date, REFERENCE_TODAY);
});

test('validateNewTransaction blocks overselling and invalid inputs', () => {
  const oil = alNoorProducts.find((p) => p.id === 'p-oil');
  const oversellErrors = validateNewTransaction({
    type: 'sale',
    product: oil,
    quantity: 50,
    unitPricePkr: 6850,
    date: REFERENCE_TODAY,
  });
  assert.equal(oversellErrors.length, 1);
  assert.match(oversellErrors[0], /Insufficient stock/);

  const validErrors = validateNewTransaction({
    type: 'sale',
    product: oil,
    quantity: 2,
    unitPricePkr: 6850,
    date: REFERENCE_TODAY,
  });
  assert.equal(validErrors.length, 0);
});

test('validateCsvBatch catches duplicate IDs, bad dates, negative quantities, and unknown SKUs', () => {
  const summary = validateCsvBatch(SAMPLE_CSV_WITH_ERRORS, alNoorProducts, alNoorTxns);
  assert.equal(summary.totalRows, 8);
  assert.equal(summary.validRows.length, 4);
  assert.equal(summary.invalidRows.length, 4);
  assert.equal(summary.validRatePercent, 50);

  const errorText = summary.invalidRows.map((r) => r.errors.join(' ')).join(' | ');
  assert.match(errorText, /Duplicate txn_code/);
  assert.match(errorText, /Invalid date/);
  assert.match(errorText, /positive number/);
  assert.match(errorText, /Unknown SKU/);
});

test('computeDemandForecast evaluates baseline vs model on eligible SKU and blocks sparse SKU', () => {
  const oil = alNoorProducts.find((p) => p.id === 'p-oil')!;
  const oilForecast = computeDemandForecast(oil, alNoorTxns, REFERENCE_TODAY, 14);
  assert.equal(oilForecast.eligible, true);
  assert.equal(oilForecast.recentStockoutDetected, true);
  assert.ok(oilForecast.rangeLow <= oilForecast.adjustedForecastUnits);
  assert.ok(oilForecast.adjustedForecastUnits <= oilForecast.rangeHigh);
  assert.ok(oilForecast.baselineWape >= 0);
  assert.ok(oilForecast.modelWape >= 0);
  assert.ok(oilForecast.suggestedReorderQty > 0);

  const datesSku = alNoorProducts.find((p) => p.id === 'p-dates')!;
  const datesForecast = computeDemandForecast(datesSku, alNoorTxns, REFERENCE_TODAY, 14);
  assert.equal(datesForecast.eligible, false);
  assert.match(datesForecast.ineligibleReason ?? '', /Sparse transaction history/);
});

test('serializeToCsv escapes commas and quotes cleanly', () => {
  const csv = serializeToCsv(['sku', 'name'], [['ALN-OIL', 'Cooking oil, 1 L']]);
  assert.equal(csv, 'sku,name\nALN-OIL,"Cooking oil, 1 L"');
});
