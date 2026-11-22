export type UserRole = 'owner' | 'inventory_clerk' | 'sales_accounts' | 'admin';

export type TransactionType = 'sale' | 'purchase' | 'adjustment';

export type QualityFlagStatus = 'clean' | 'flagged' | 'resolved';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  shortLabel: string;
  summary: string;
  canApproveForecasts: boolean;
  canAdjustStock: boolean;
  canRecordTransactions: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
}

export interface ProductRecord {
  id: string;
  tenantId: string;
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
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  tenantId: string;
  txnCode: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  productId: string;
  quantity: number; // positive for sale/purchase, signed or delta for adjustment
  unitPricePkr: number;
  locationCode: string;
  referenceNote: string;
  recordedBy: string;
  qualityStatus: QualityFlagStatus;
  qualityIssue?: string;
}

export interface ForecastDecision {
  productId: string;
  tenantId: string;
  status: 'pending' | 'accepted' | 'dismissed';
  suggestedQty: number;
  horizonDays: number;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
}

export interface OrgUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited';
  lastActive: string;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  category: 'inventory' | 'transaction' | 'forecast' | 'access' | 'export';
  action: string;
  detail: string;
}

export interface TenantOrganization {
  id: string;
  name: string;
  city: string;
  sector: string;
  currency: 'PKR';
}

export const BRAND_LOGO_SRC = '/assets/aistudio/NexaERP_AI_connected_N_emblem_0af07304.png';

export const ROLES: Record<UserRole, RoleDefinition> = {
  owner: {
    id: 'owner',
    label: 'Owner / Manager',
    shortLabel: 'Owner',
    summary: 'Reviews trends, low-stock queues, exports, and accepts or dismisses reorder suggestions.',
    canApproveForecasts: true,
    canAdjustStock: false,
    canRecordTransactions: false,
    canManageUsers: false,
    canExportData: true,
  },
  inventory_clerk: {
    id: 'inventory_clerk',
    label: 'Inventory Clerk',
    shortLabel: 'Inventory',
    summary: 'Records stock receipts, physical stock counts, adjustments, and minimum thresholds.',
    canApproveForecasts: false,
    canAdjustStock: true,
    canRecordTransactions: false,
    canManageUsers: false,
    canExportData: false,
  },
  sales_accounts: {
    id: 'sales_accounts',
    label: 'Sales / Accounts Staff',
    shortLabel: 'Sales & Accts',
    summary: 'Records sales and purchases, imports CSV batches, and resolves flagged records.',
    canApproveForecasts: false,
    canAdjustStock: false,
    canRecordTransactions: true,
    canManageUsers: false,
    canExportData: true,
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    shortLabel: 'Admin',
    summary: 'Invites users, assigns roles, configures products, and audits organization activity.',
    canApproveForecasts: true,
    canAdjustStock: true,
    canRecordTransactions: true,
    canManageUsers: true,
    canExportData: true,
  },
};

export const TENANTS: TenantOrganization[] = [
  {
    id: 'alnoor-khi',
    name: 'Al-Noor Traders',
    city: 'Karachi',
    sector: 'Wholesale & Retail Staples',
    currency: 'PKR',
  },
  {
    id: 'crescent-lhr',
    name: 'Crescent Hardware',
    city: 'Lahore',
    sector: 'Electrical & Building Supplies',
    currency: 'PKR',
  },
];

// Anchor reference date for active operations ledger
export const REFERENCE_TODAY = '2026-11-22';

function shiftDate(baseIso: string, deltaDays: number): string {
  const d = new Date(`${baseIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export const INITIAL_PRODUCTS: ProductRecord[] = [
  // Al-Noor Traders (Karachi)
  {
    id: 'p-oil',
    tenantId: 'alnoor-khi',
    sku: 'ALN-OIL-1L',
    name: 'Cooking oil, 1 L',
    category: 'Pantry',
    unit: 'cartons',
    onHand: 8,
    minThreshold: 14,
    unitCostPkr: 6200,
    unitPricePkr: 6850,
    leadTimeDays: 3,
    locationCode: 'KHI-WH1',
    updatedAt: shiftDate(REFERENCE_TODAY, -1),
  },
  {
    id: 'p-rice',
    tenantId: 'alnoor-khi',
    sku: 'ALN-RIC-5K',
    name: 'Basmati rice, 5 kg',
    category: 'Staples',
    unit: 'bags',
    onHand: 48,
    minThreshold: 22,
    unitCostPkr: 1550,
    unitPricePkr: 1820,
    leadTimeDays: 4,
    locationCode: 'KHI-WH1',
    updatedAt: REFERENCE_TODAY,
  },
  {
    id: 'p-tea',
    tenantId: 'alnoor-khi',
    sku: 'ALN-TEA-450',
    name: 'Black tea, 450 g',
    category: 'Beverages',
    unit: 'packs',
    onHand: 11,
    minThreshold: 18,
    unitCostPkr: 690,
    unitPricePkr: 790,
    leadTimeDays: 2,
    locationCode: 'KHI-SHP',
    updatedAt: REFERENCE_TODAY,
  },
  {
    id: 'p-sugar',
    tenantId: 'alnoor-khi',
    sku: 'ALN-SUG-50K',
    name: 'Refined sugar, 50 kg',
    category: 'Staples',
    unit: 'sacks',
    onHand: 19,
    minThreshold: 15,
    unitCostPkr: 6800,
    unitPricePkr: 7350,
    leadTimeDays: 5,
    locationCode: 'KHI-WH1',
    updatedAt: shiftDate(REFERENCE_TODAY, -2),
  },
  {
    id: 'p-flour',
    tenantId: 'alnoor-khi',
    sku: 'ALN-FLR-20K',
    name: 'Wheat flour, 20 kg',
    category: 'Staples',
    unit: 'bags',
    onHand: 9,
    minThreshold: 16,
    unitCostPkr: 2150,
    unitPricePkr: 2420,
    leadTimeDays: 2,
    locationCode: 'KHI-WH1',
    updatedAt: REFERENCE_TODAY,
  },
  {
    id: 'p-milk',
    tenantId: 'alnoor-khi',
    sku: 'ALN-MLK-800',
    name: 'Powdered milk, 800 g',
    category: 'Dairy',
    unit: 'tins',
    onHand: 34,
    minThreshold: 15,
    unitCostPkr: 1180,
    unitPricePkr: 1360,
    leadTimeDays: 4,
    locationCode: 'KHI-SHP',
    updatedAt: shiftDate(REFERENCE_TODAY, -1),
  },
  {
    id: 'p-spice',
    tenantId: 'alnoor-khi',
    sku: 'ALN-CHL-200',
    name: 'Red chilli powder, 200 g',
    category: 'Spices',
    unit: 'packs',
    onHand: 62,
    minThreshold: 25,
    unitCostPkr: 230,
    unitPricePkr: 285,
    leadTimeDays: 3,
    locationCode: 'KHI-SHP',
    updatedAt: shiftDate(REFERENCE_TODAY, -3),
  },
  {
    id: 'p-dates',
    tenantId: 'alnoor-khi',
    sku: 'ALN-DAT-1K',
    name: 'Seasonal dates box, 1 kg',
    category: 'Seasonal',
    unit: 'boxes',
    onHand: 6,
    minThreshold: 10,
    unitCostPkr: 850,
    unitPricePkr: 1050,
    leadTimeDays: 6,
    locationCode: 'KHI-SHP',
    updatedAt: shiftDate(REFERENCE_TODAY, -4),
  },
  // Crescent Hardware (Lahore)
  {
    id: 'p-led',
    tenantId: 'crescent-lhr',
    sku: 'CRS-LED-12W',
    name: 'LED bulb 12W (10-pack)',
    category: 'Lighting',
    unit: 'boxes',
    onHand: 11,
    minThreshold: 16,
    unitCostPkr: 2400,
    unitPricePkr: 2850,
    leadTimeDays: 3,
    locationCode: 'LHR-STR',
    updatedAt: REFERENCE_TODAY,
  },
  {
    id: 'p-cable',
    tenantId: 'crescent-lhr',
    sku: 'CRS-CBL-90M',
    name: 'Copper wire coil, 90 m',
    category: 'Wiring',
    unit: 'coils',
    onHand: 28,
    minThreshold: 12,
    unitCostPkr: 8400,
    unitPricePkr: 9450,
    leadTimeDays: 5,
    locationCode: 'LHR-WH1',
    updatedAt: shiftDate(REFERENCE_TODAY, -1),
  },
  {
    id: 'p-breaker',
    tenantId: 'crescent-lhr',
    sku: 'CRS-MCB-32A',
    name: 'Circuit breaker 32A',
    category: 'Switchgear',
    unit: 'units',
    onHand: 7,
    minThreshold: 15,
    unitCostPkr: 720,
    unitPricePkr: 890,
    leadTimeDays: 4,
    locationCode: 'LHR-STR',
    updatedAt: shiftDate(REFERENCE_TODAY, -1),
  },
  {
    id: 'p-primer',
    tenantId: 'crescent-lhr',
    sku: 'CRS-PRM-4L',
    name: 'Wall primer, 4 L',
    category: 'Paints',
    unit: 'tins',
    onHand: 22,
    minThreshold: 10,
    unitCostPkr: 1950,
    unitPricePkr: 2300,
    leadTimeDays: 3,
    locationCode: 'LHR-WH1',
    updatedAt: shiftDate(REFERENCE_TODAY, -2),
  },
];

// Deterministic 56-day synthetic history so seasonal-naive (7-day lag) and WAPE backtests are grounded in real rows
function buildAlNoorHistory(): TransactionRecord[] {
  const rows: TransactionRecord[] = [];
  let seq = 1001;

  const patterns: {
    productId: string;
    baseDaily: number;
    weekdayBoost: number[]; // Sun..Sat multiplier
    unitPrice: number;
    unitCost: number;
    location: string;
    sparseStartDay?: number;
    stockoutDays?: number[];
  }[] = [
    {
      productId: 'p-oil',
      baseDaily: 4,
      weekdayBoost: [0.6, 1.1, 1.0, 1.2, 1.3, 1.4, 1.1],
      unitPrice: 6850,
      unitCost: 6200,
      location: 'KHI-WH1',
      stockoutDays: [4, 5], // recent stock-out days ago
    },
    {
      productId: 'p-rice',
      baseDaily: 6,
      weekdayBoost: [0.7, 1.0, 1.1, 1.0, 1.2, 1.5, 1.2],
      unitPrice: 1820,
      unitCost: 1550,
      location: 'KHI-WH1',
    },
    {
      productId: 'p-tea',
      baseDaily: 5,
      weekdayBoost: [0.5, 1.2, 1.1, 1.0, 1.2, 1.3, 1.0],
      unitPrice: 790,
      unitCost: 690,
      location: 'KHI-SHP',
    },
    {
      productId: 'p-sugar',
      baseDaily: 3,
      weekdayBoost: [0.5, 1.0, 1.2, 1.0, 1.1, 1.4, 1.0],
      unitPrice: 7350,
      unitCost: 6800,
      location: 'KHI-WH1',
    },
    {
      productId: 'p-flour',
      baseDaily: 5,
      weekdayBoost: [0.6, 1.1, 1.1, 1.2, 1.1, 1.5, 1.1],
      unitPrice: 2420,
      unitCost: 2150,
      location: 'KHI-WH1',
    },
    {
      productId: 'p-milk',
      baseDaily: 3,
      weekdayBoost: [0.6, 1.0, 1.0, 1.1, 1.2, 1.3, 1.1],
      unitPrice: 1360,
      unitCost: 1180,
      location: 'KHI-SHP',
    },
    {
      productId: 'p-spice',
      baseDaily: 4,
      weekdayBoost: [0.5, 1.0, 1.1, 1.0, 1.1, 1.2, 1.0],
      unitPrice: 285,
      unitCost: 230,
      location: 'KHI-SHP',
    },
    {
      productId: 'p-dates',
      baseDaily: 2,
      weekdayBoost: [1, 1, 1, 1, 1, 1, 1],
      unitPrice: 1050,
      unitCost: 850,
      location: 'KHI-SHP',
      sparseStartDay: 6, // Only 6 days ago -> triggers data sufficiency warning
    },
  ];

  for (let daysAgo = 55; daysAgo >= 0; daysAgo--) {
    const date = shiftDate(REFERENCE_TODAY, -daysAgo);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();

    for (const p of patterns) {
      if (p.sparseStartDay !== undefined && daysAgo > p.sparseStartDay) {
        continue;
      }
      if (p.stockoutDays?.includes(daysAgo)) {
        continue;
      }
      // Deterministic micro-variation
      const jitter = ((daysAgo * 7 + p.productId.length * 3) % 3) - 1;
      const qty = Math.max(1, Math.round(p.baseDaily * p.weekdayBoost[dow] + jitter * 0.5));

      const isFlaggedRow = p.productId === 'p-flour' && daysAgo === 2;
      rows.push({
        id: `tx-aln-${seq}`,
        tenantId: 'alnoor-khi',
        txnCode: `TXN-${seq}`,
        date,
        type: 'sale',
        productId: p.productId,
        quantity: qty,
        unitPricePkr: isFlaggedRow ? 0 : p.unitPrice,
        locationCode: p.location,
        referenceNote: isFlaggedRow
          ? 'Imported sheet row — missing unit price'
          : 'Counter & wholesale dispatch',
        recordedBy: 'Bilal Ahmed',
        qualityStatus: isFlaggedRow ? 'flagged' : 'clean',
        qualityIssue: isFlaggedRow
          ? 'Unit price recorded as PKR 0. Verify invoice before month-end summary.'
          : undefined,
      });
      seq++;

      // Bi-weekly replenishment purchases
      if (daysAgo % 14 === 10 && p.sparseStartDay === undefined) {
        const restockQty = p.baseDaily * 14;
        rows.push({
          id: `tx-aln-${seq}`,
          tenantId: 'alnoor-khi',
          txnCode: `TXN-${seq}`,
          date,
          type: 'purchase',
          productId: p.productId,
          quantity: restockQty,
          unitPricePkr: p.unitCost,
          locationCode: p.location,
          referenceNote: 'Supplier batch receipt',
          recordedBy: 'Saad Raza',
          qualityStatus: 'clean',
        });
        seq++;
      }
    }
  }

  // Add one flagged duplicate-suspect adjustment for demo completeness
  rows.push({
    id: `tx-aln-${seq}`,
    tenantId: 'alnoor-khi',
    txnCode: `TXN-${seq}`,
    date: shiftDate(REFERENCE_TODAY, -1),
    type: 'adjustment',
    productId: 'p-oil',
    quantity: -1,
    unitPricePkr: 6200,
    locationCode: 'KHI-WH1',
    referenceNote: 'Damaged carton write-off',
    recordedBy: 'Saad Raza',
    qualityStatus: 'flagged',
    qualityIssue: 'Manual write-off missing supervisor slip reference.',
  });

  return rows;
}

function buildCrescentHistory(): TransactionRecord[] {
  const rows: TransactionRecord[] = [];
  let seq = 2001;
  const items = [
    { productId: 'p-led', base: 4, price: 2850, cost: 2400, loc: 'LHR-STR' },
    { productId: 'p-cable', base: 2, price: 9450, cost: 8400, loc: 'LHR-WH1' },
    { productId: 'p-breaker', base: 5, price: 890, cost: 720, loc: 'LHR-STR' },
    { productId: 'p-primer', base: 2, price: 2300, cost: 1950, loc: 'LHR-WH1' },
  ];

  for (let daysAgo = 35; daysAgo >= 0; daysAgo--) {
    const date = shiftDate(REFERENCE_TODAY, -daysAgo);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    for (const item of items) {
      const mult = dow === 0 ? 0.4 : dow === 5 ? 1.3 : 1.0;
      const qty = Math.max(1, Math.round(item.base * mult));
      rows.push({
        id: `tx-crs-${seq}`,
        tenantId: 'crescent-lhr',
        txnCode: `CRS-${seq}`,
        date,
        type: 'sale',
        productId: item.productId,
        quantity: qty,
        unitPricePkr: item.price,
        locationCode: item.loc,
        referenceNote: 'Trade counter sale',
        recordedBy: 'Zainab Tariq',
        qualityStatus: 'clean',
      });
      seq++;
      if (daysAgo % 14 === 7) {
        rows.push({
          id: `tx-crs-${seq}`,
          tenantId: 'crescent-lhr',
          txnCode: `CRS-${seq}`,
          date,
          type: 'purchase',
          productId: item.productId,
          quantity: item.base * 14,
          unitPricePkr: item.cost,
          locationCode: item.loc,
          referenceNote: 'Distributor restock',
          recordedBy: 'Kamran Malik',
          qualityStatus: 'clean',
        });
        seq++;
      }
    }
  }
  return rows;
}

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  ...buildAlNoorHistory(),
  ...buildCrescentHistory(),
];

export const INITIAL_USERS: OrgUser[] = [
  {
    id: 'u-1',
    tenantId: 'alnoor-khi',
    name: 'Tariq Mahmood',
    email: 'tariq@alnoortraders.pk',
    role: 'owner',
    status: 'active',
    lastActive: 'Today, 09:15',
  },
  {
    id: 'u-2',
    tenantId: 'alnoor-khi',
    name: 'Saad Raza',
    email: 'saad@alnoortraders.pk',
    role: 'inventory_clerk',
    status: 'active',
    lastActive: 'Today, 08:40',
  },
  {
    id: 'u-3',
    tenantId: 'alnoor-khi',
    name: 'Bilal Ahmed',
    email: 'bilal@alnoortraders.pk',
    role: 'sales_accounts',
    status: 'active',
    lastActive: 'Yesterday, 17:50',
  },
  {
    id: 'u-4',
    tenantId: 'alnoor-khi',
    name: 'Amina Siddiqui',
    email: 'amina@alnoortraders.pk',
    role: 'admin',
    status: 'active',
    lastActive: 'Today, 10:05',
  },
  {
    id: 'u-5',
    tenantId: 'crescent-lhr',
    name: 'Kamran Malik',
    email: 'kamran@crescenthardware.pk',
    role: 'owner',
    status: 'active',
    lastActive: 'Today, 09:00',
  },
  {
    id: 'u-6',
    tenantId: 'crescent-lhr',
    name: 'Zainab Tariq',
    email: 'zainab@crescenthardware.pk',
    role: 'sales_accounts',
    status: 'active',
    lastActive: 'Yesterday, 16:20',
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    tenantId: 'alnoor-khi',
    timestamp: `${REFERENCE_TODAY} 09:12`,
    actorName: 'Saad Raza',
    actorRole: 'inventory_clerk',
    category: 'inventory',
    action: 'Low-stock threshold triggered',
    detail: 'Cooking oil, 1 L dropped to 8 cartons (min threshold: 14 cartons).',
  },
  {
    id: 'aud-2',
    tenantId: 'alnoor-khi',
    timestamp: `${shiftDate(REFERENCE_TODAY, -1)} 17:45`,
    actorName: 'Bilal Ahmed',
    actorRole: 'sales_accounts',
    category: 'transaction',
    action: 'Data-quality check flagged record',
    detail: 'Sale row for Wheat flour, 20 kg flagged with PKR 0 unit price for manual check.',
  },
  {
    id: 'aud-3',
    tenantId: 'alnoor-khi',
    timestamp: `${shiftDate(REFERENCE_TODAY, -2)} 14:20`,
    actorName: 'Tariq Mahmood',
    actorRole: 'owner',
    category: 'forecast',
    action: 'Forecast baseline evaluated',
    detail: 'Rolling-origin 14-day evaluation run across 7 eligible SKUs.',
  },
  {
    id: 'aud-4',
    tenantId: 'crescent-lhr',
    timestamp: `${REFERENCE_TODAY} 09:05`,
    actorName: 'Kamran Malik',
    actorRole: 'owner',
    category: 'access',
    action: 'Tenant session initialized',
    detail: 'Crescent Hardware workspace loaded with isolated Lahore records.',
  },
];

export const SAMPLE_CSV_WITH_ERRORS = `txn_code,date,type,sku,quantity,unit_price_pkr,location_code,note
TXN-9001,2026-11-22,sale,ALN-RIC-5K,6,1820,KHI-WH1,Morning retail dispatch
TXN-9002,2026-11-22,sale,ALN-TEA-450,4,790,KHI-SHP,Counter sale
TXN-9003,2026-11-22,purchase,ALN-OIL-1L,15,6200,KHI-WH1,Supplier delivery batch
TXN-9003,2026-11-22,sale,ALN-OIL-1L,2,6850,KHI-WH1,Duplicate ID test row
TXN-9005,22-11-2026,sale,ALN-SUG-50K,3,7350,KHI-WH1,Invalid date format row
TXN-9006,2026-11-22,sale,ALN-FLR-20K,-4,2420,KHI-WH1,Negative quantity error
TXN-9007,2026-11-22,sale,UNKNOWN-SKU-99,5,500,KHI-SHP,Unknown product reference
TXN-9008,2026-11-22,sale,ALN-MLK-800,5,1360,KHI-SHP,Afternoon counter order`;

export const PROPOSAL_METADATA = {
  university: 'NED University of Engineering & Technology',
  department: 'Department of Computer Science and Information Technology (Data Science)',
  course: 'Data Science Platform Architecture and Application',
  team: [
    { name: 'Abdullah Irshad', id: 'CT-24271', role: 'Project and Product Lead' },
    { name: 'Hafiz Hammad Shahid', id: 'CT-24274', role: 'Data and ML Lead' },
    { name: 'Umer Pervez', id: 'CT-24254', role: 'Platform and Security Lead' },
    { name: 'Gohar Zehra', id: 'CT-24063', role: 'Application and UX Lead' },
  ],
  exclusions: [
    'Autonomous purchasing without human confirmation',
    'Payroll and employee performance scoring',
    'Tax filing and statutory accounting',
    'Bank or payment gateway processing',
    'Complex multi-stage manufacturing',
    'Custom foundation-model training or credit decisions',
  ],
  successTargets: [
    'At least 80% task completion in usability testing with representative SME users',
    'Forecast WAPE improves >= 10% over seasonal-naive baseline on eligible SKUs',
    'At least 95% of valid CSV rows import cleanly; invalid rows get actionable error messages',
    '95th percentile dashboard API response under 2 seconds at SME scale',
  ],
};
