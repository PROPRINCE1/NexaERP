import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BRAND_LOGO_SRC,
  INITIAL_AUDIT_EVENTS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  REFERENCE_TODAY,
  ROLES,
  TENANTS,
  type AuditEvent,
  type ForecastDecision,
  type OrgUser,
  type ProductRecord,
  type TransactionRecord,
  type TransactionType,
  type UserRole,
} from '../../data/erpSeedData';
import {
  isLowStock,
  validateNewTransaction,
  type CsvValidationSummary,
} from '../../utils/erpEngine';
import { AccessAuditView } from './AccessAuditView';
import { ForecastView } from './ForecastView';
import { InventoryView } from './InventoryView';
import { OverviewView } from './OverviewView';
import { ProposalModal } from './ProposalModal';
import { TopNavbar, type WorkspaceViewId } from './TopNavbar';
import { TransactionsView } from './TransactionsView';

const STORAGE_KEY = 'nexaerp_proto_state_v1';

interface PersistedErpState {
  activeTenantId: string;
  activeRole: UserRole;
  products: ProductRecord[];
  transactions: TransactionRecord[];
  users: OrgUser[];
  auditEvents: AuditEvent[];
  forecastDecisions: Record<string, ForecastDecision>;
}

let inMemoryStateCache: PersistedErpState | null = null;

function getDefaultState(): PersistedErpState {
  return {
    activeTenantId: TENANTS[0].id,
    activeRole: 'owner',
    products: INITIAL_PRODUCTS,
    transactions: INITIAL_TRANSACTIONS,
    users: INITIAL_USERS,
    auditEvents: INITIAL_AUDIT_EVENTS,
    forecastDecisions: {},
  };
}

function loadInitialState(): PersistedErpState {
  if (inMemoryStateCache) return inMemoryStateCache;
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedErpState>;
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.transactions)) {
      return getDefaultState();
    }
    return {
      activeTenantId: parsed.activeTenantId || TENANTS[0].id,
      activeRole: parsed.activeRole || 'owner',
      products: parsed.products,
      transactions: parsed.transactions,
      users: Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS,
      auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : INITIAL_AUDIT_EVENTS,
      forecastDecisions: parsed.forecastDecisions ?? {},
    };
  } catch {
    return getDefaultState();
  }
}

interface ErpWorkspaceProps {
  activeView: WorkspaceViewId;
  onSelectView: (view: WorkspaceViewId) => void;
  onExitWorkspace: () => void;
}

export function ErpWorkspace({
  activeView,
  onSelectView,
  onExitWorkspace,
}: ErpWorkspaceProps) {
  const [state, setState] = useState<PersistedErpState>(loadInitialState);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [selectedForecastId, setSelectedForecastId] = useState<string>('p-oil');
  const [footerLogoError, setFooterLogoError] = useState(false);

  useEffect(() => {
    inMemoryStateCache = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues in restricted browsers
    }
  }, [state]);

  const activeTenant = useMemo(
    () => TENANTS.find((t) => t.id === state.activeTenantId) ?? TENANTS[0],
    [state.activeTenantId],
  );

  const tenantProducts = useMemo(
    () => state.products.filter((p) => p.tenantId === activeTenant.id),
    [state.products, activeTenant.id],
  );

  const tenantTransactions = useMemo(
    () => state.transactions.filter((t) => t.tenantId === activeTenant.id),
    [state.transactions, activeTenant.id],
  );

  const tenantUsers = useMemo(
    () => state.users.filter((u) => u.tenantId === activeTenant.id),
    [state.users, activeTenant.id],
  );

  const tenantAudits = useMemo(
    () => state.auditEvents.filter((a) => a.tenantId === activeTenant.id),
    [state.auditEvents, activeTenant.id],
  );

  const lowStockCount = useMemo(
    () => tenantProducts.filter((p) => isLowStock(p)).length,
    [tenantProducts],
  );

  const flaggedCount = useMemo(
    () => tenantTransactions.filter((t) => t.qualityStatus === 'flagged').length,
    [tenantTransactions],
  );

  const effectiveForecastId = useMemo(() => {
    if (tenantProducts.some((p) => p.id === selectedForecastId)) {
      return selectedForecastId;
    }
    return tenantProducts[0]?.id ?? '';
  }, [tenantProducts, selectedForecastId]);

  const currentActorName = useMemo(() => {
    const match = tenantUsers.find((u) => u.role === state.activeRole);
    return match?.name ?? ROLES[state.activeRole].label;
  }, [tenantUsers, state.activeRole]);

  const createAuditEntry = (
    category: AuditEvent['category'],
    action: string,
    detail: string,
    prevState: PersistedErpState,
  ): AuditEvent => ({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId: prevState.activeTenantId,
    timestamp: `${REFERENCE_TODAY} ${new Date().toTimeString().slice(0, 5)}`,
    actorName: currentActorName,
    actorRole: prevState.activeRole,
    category,
    action,
    detail,
  });

  const handleChangeTenant = (tenantId: string) => {
    setState((prev) => ({ ...prev, activeTenantId: tenantId }));
    setSelectedInventoryId(null);
  };

  const handleChangeRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, activeRole: role }));
  };

  const handleResetWorkspace = () => {
    const fresh = getDefaultState();
    inMemoryStateCache = fresh;
    setState(fresh);
    setSelectedInventoryId(null);
    setSelectedForecastId('p-oil');
    onSelectView('overview');
  };

  const handleAddProduct = (input: {
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
  }): string | null => {
    if (!input.sku || !input.name) return 'SKU and product name are required.';
    if (tenantProducts.some((p) => p.sku.toUpperCase() === input.sku.toUpperCase())) {
      return `SKU "${input.sku}" already exists in ${activeTenant.name}.`;
    }
    if (input.onHand < 0 || input.minThreshold < 0 || input.unitCostPkr < 0 || input.unitPricePkr < 0) {
      return 'Quantities and PKR prices must be non-negative.';
    }

    const newProduct: ProductRecord = {
      id: `p-${Date.now()}`,
      tenantId: activeTenant.id,
      ...input,
      updatedAt: REFERENCE_TODAY,
    };

    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      auditEvents: [
        createAuditEntry(
          'inventory',
          'Product created',
          `Added ${newProduct.name} (${newProduct.sku}) with ${newProduct.onHand} ${newProduct.unit}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
    return null;
  };

  const handleUpdateThreshold = (productId: string, newThreshold: number) => {
    const target = tenantProducts.find((p) => p.id === productId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, minThreshold: newThreshold, updatedAt: REFERENCE_TODAY } : p,
      ),
      auditEvents: [
        createAuditEntry(
          'inventory',
          'Threshold updated',
          `${target.name} min threshold changed from ${target.minThreshold} to ${newThreshold} ${target.unit}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
  };

  const handleRecordStockAdjustment = (input: {
    productId: string;
    deltaQty: number;
    note: string;
  }): string | null => {
    const product = tenantProducts.find((p) => p.id === input.productId);
    const errors = validateNewTransaction({
      type: 'adjustment',
      product,
      quantity: input.deltaQty,
      unitPricePkr: product?.unitCostPkr ?? 0,
      date: REFERENCE_TODAY,
    });
    if (errors.length > 0) return errors[0];
    if (!product) return 'Product not found.';

    const txnCode = `ADJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: TransactionRecord = {
      id: `tx-${Date.now()}`,
      tenantId: activeTenant.id,
      txnCode,
      date: REFERENCE_TODAY,
      type: 'adjustment',
      productId: product.id,
      quantity: input.deltaQty,
      unitPricePkr: product.unitCostPkr,
      locationCode: product.locationCode,
      referenceNote: input.note,
      recordedBy: currentActorName,
      qualityStatus: 'clean',
    };

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === product.id
          ? { ...p, onHand: p.onHand + input.deltaQty, updatedAt: REFERENCE_TODAY }
          : p,
      ),
      transactions: [newTxn, ...prev.transactions],
      auditEvents: [
        createAuditEntry(
          'inventory',
          'Stock adjusted',
          `${product.name}: ${input.deltaQty > 0 ? '+' : ''}${input.deltaQty} ${product.unit} (${input.note}).`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
    return null;
  };

  const handleRecordTransaction = (input: {
    type: TransactionType;
    productId: string;
    quantity: number;
    unitPricePkr: number;
    date: string;
    referenceNote: string;
  }): string | null => {
    const product = tenantProducts.find((p) => p.id === input.productId);
    const errors = validateNewTransaction({
      type: input.type,
      product,
      quantity: input.quantity,
      unitPricePkr: input.unitPricePkr,
      date: input.date,
    });
    if (errors.length > 0) return errors[0];
    if (!product) return 'Select a valid product.';

    const stockDelta = input.type === 'sale' ? -input.quantity : input.quantity;
    const txnCode = `${input.type === 'sale' ? 'SAL' : 'PUR'}-${Math.floor(3000 + Math.random() * 6999)}`;
    const newTxn: TransactionRecord = {
      id: `tx-${Date.now()}`,
      tenantId: activeTenant.id,
      txnCode,
      date: input.date,
      type: input.type,
      productId: product.id,
      quantity: input.quantity,
      unitPricePkr: input.unitPricePkr,
      locationCode: product.locationCode,
      referenceNote: input.referenceNote,
      recordedBy: currentActorName,
      qualityStatus: 'clean',
    };

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === product.id
          ? { ...p, onHand: p.onHand + stockDelta, updatedAt: REFERENCE_TODAY }
          : p,
      ),
      transactions: [newTxn, ...prev.transactions],
      auditEvents: [
        createAuditEntry(
          'transaction',
          `${input.type === 'sale' ? 'Sale' : 'Purchase'} recorded`,
          `${txnCode}: ${input.quantity} ${product.unit} of ${product.name}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
    return null;
  };

  const handleImportValidCsvRows = (summary: CsvValidationSummary): number => {
    if (summary.validRows.length === 0) return 0;
    const stockDeltas = new Map<string, number>();
    const newTxns: TransactionRecord[] = [];

    for (const row of summary.validRows) {
      if (!row.resolvedProductId || row.quantity === null || row.unitPricePkr === null) continue;
      const txnType = row.type as 'sale' | 'purchase';
      const delta = txnType === 'sale' ? -row.quantity : row.quantity;
      stockDeltas.set(row.resolvedProductId, (stockDeltas.get(row.resolvedProductId) ?? 0) + delta);
      newTxns.push({
        id: `tx-csv-${Date.now()}-${row.rowNumber}`,
        tenantId: activeTenant.id,
        txnCode: row.txnCode,
        date: row.date,
        type: txnType,
        productId: row.resolvedProductId,
        quantity: row.quantity,
        unitPricePkr: row.unitPricePkr,
        locationCode: row.locationCode,
        referenceNote: row.note || 'Validated CSV import',
        recordedBy: currentActorName,
        qualityStatus: 'clean',
      });
    }

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        const delta = stockDeltas.get(p.id);
        if (!delta) return p;
        return { ...p, onHand: Math.max(0, p.onHand + delta), updatedAt: REFERENCE_TODAY };
      }),
      transactions: [...newTxns, ...prev.transactions],
      auditEvents: [
        createAuditEntry(
          'transaction',
          'CSV batch imported',
          `Imported ${newTxns.length} valid rows (${summary.invalidRows.length} invalid rows rejected).`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));

    return newTxns.length;
  };

  const handleResolveFlaggedTransaction = (
    txnId: string,
    updatedUnitPrice: number,
    note: string,
  ) => {
    const target = tenantTransactions.find((t) => t.id === txnId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === txnId
          ? {
              ...t,
              unitPricePkr: updatedUnitPrice,
              referenceNote: note,
              qualityStatus: 'resolved',
              qualityIssue: undefined,
            }
          : t,
      ),
      auditEvents: [
        createAuditEntry(
          'transaction',
          'Flagged record resolved',
          `${target.txnCode} verified with unit price PKR ${updatedUnitPrice}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
  };

  const handleDecideForecast = (
    productId: string,
    status: 'accepted' | 'dismissed',
    suggestedQty: number,
    horizonDays: number,
    note: string,
  ) => {
    const prod = tenantProducts.find((p) => p.id === productId);
    const decision: ForecastDecision = {
      productId,
      tenantId: activeTenant.id,
      status,
      suggestedQty,
      horizonDays,
      decidedBy: currentActorName,
      decidedAt: REFERENCE_TODAY,
      note,
    };

    setState((prev) => ({
      ...prev,
      forecastDecisions: {
        ...prev.forecastDecisions,
        [`${activeTenant.id}:${productId}`]: decision,
      },
      auditEvents: [
        createAuditEntry(
          'forecast',
          status === 'accepted' ? 'Reorder suggestion approved' : 'Reorder suggestion dismissed',
          `${prod?.name ?? productId}: ${suggestedQty} ${prod?.unit ?? 'units'} (${horizonDays}d horizon) — ${note}`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
  };

  const handleInviteUser = (input: {
    name: string;
    email: string;
    role: UserRole;
  }): string | null => {
    if (!input.name || !input.email) return 'Name and email are required.';
    if (tenantUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return 'A user with this email already belongs to the active organization.';
    }
    const newUser: OrgUser = {
      id: `u-${Date.now()}`,
      tenantId: activeTenant.id,
      name: input.name,
      email: input.email,
      role: input.role,
      status: 'invited',
      lastActive: 'Pending acceptance',
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      auditEvents: [
        createAuditEntry(
          'access',
          'User invited',
          `Invited ${input.name} (${input.email}) as ${ROLES[input.role].label}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
    return null;
  };

  const handleChangeUserRole = (userId: string, role: UserRole) => {
    const target = tenantUsers.find((u) => u.id === userId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, role } : u)),
      auditEvents: [
        createAuditEntry(
          'access',
          'User role updated',
          `Changed ${target.name} from ${ROLES[target.role].label} to ${ROLES[role].label}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
  };

  const handleLogExport = (datasetLabel: string, rowCount: number) => {
    setState((prev) => ({
      ...prev,
      auditEvents: [
        createAuditEntry(
          'export',
          'CSV exported',
          `Downloaded ${datasetLabel} (${rowCount} rows) for ${activeTenant.name}.`,
          prev,
        ),
        ...prev.auditEvents,
      ],
    }));
  };

  const tenantDecisions = useMemo(() => {
    const result: Record<string, ForecastDecision> = {};
    for (const [k, v] of Object.entries(state.forecastDecisions)) {
      if (v.tenantId === activeTenant.id) {
        result[k.replace(`${activeTenant.id}:`, '')] = v;
      }
    }
    return result;
  }, [state.forecastDecisions, activeTenant.id]);

  return (
    <>
      <a
        href="#workspace-main"
        className="fixed top-3 left-3 z-50 -translate-y-40 rounded-[4px] bg-[#0a2232] px-4 py-2 text-xs font-semibold text-[#eef5f1] transition-transform focus:translate-y-0"
      >
        Skip to workspace
      </a>

      <TopNavbar
        activeView={activeView}
        onSelectView={onSelectView}
        activeTenant={activeTenant}
        onChangeTenant={handleChangeTenant}
        activeRole={state.activeRole}
        onChangeRole={handleChangeRole}
        lowStockCount={lowStockCount}
        flaggedCount={flaggedCount}
        onOpenProposal={() => setProposalOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        onExitWorkspace={onExitWorkspace}
      />

      <main
        id="workspace-main"
        className="relative z-10 flex-1 mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTenant.id}:${activeView}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeView === 'overview' && (
              <OverviewView
                products={tenantProducts}
                transactions={tenantTransactions}
                onNavigate={onSelectView}
                onSelectProductForInventory={(pid) => {
                  setSelectedInventoryId(pid);
                  onSelectView('inventory');
                }}
                onSelectProductForForecast={(pid) => {
                  setSelectedForecastId(pid);
                  onSelectView('forecast');
                }}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryView
                products={tenantProducts}
                transactions={tenantTransactions}
                activeRole={state.activeRole}
                selectedProductId={selectedInventoryId}
                onSelectProduct={setSelectedInventoryId}
                onAddProduct={handleAddProduct}
                onUpdateThreshold={handleUpdateThreshold}
                onRecordStockAdjustment={handleRecordStockAdjustment}
                onJumpToForecast={(pid) => {
                  setSelectedForecastId(pid);
                  onSelectView('forecast');
                }}
              />
            )}

            {activeView === 'transactions' && (
              <TransactionsView
                products={tenantProducts}
                transactions={tenantTransactions}
                activeRole={state.activeRole}
                onRecordTransaction={handleRecordTransaction}
                onImportValidCsvRows={handleImportValidCsvRows}
                onResolveFlaggedTransaction={handleResolveFlaggedTransaction}
              />
            )}

            {activeView === 'forecast' && (
              <ForecastView
                products={tenantProducts}
                transactions={tenantTransactions}
                activeRole={state.activeRole}
                selectedProductId={effectiveForecastId}
                onSelectProductId={setSelectedForecastId}
                decisions={tenantDecisions}
                onDecideForecast={handleDecideForecast}
                onSeeHistory={(pid) => {
                  setSelectedInventoryId(pid);
                  onSelectView('inventory');
                }}
              />
            )}

            {activeView === 'access' && (
              <AccessAuditView
                tenant={activeTenant}
                activeRole={state.activeRole}
                users={tenantUsers}
                auditEvents={tenantAudits}
                products={tenantProducts}
                transactions={tenantTransactions}
                onInviteUser={handleInviteUser}
                onChangeUserRole={handleChangeUserRole}
                onLogExport={handleLogExport}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 mt-auto border-t border-white/10 bg-[#0a2232] text-[#d5e3df]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex shrink-0 items-center rounded-[3px] bg-[#e9f2ed] px-2 py-0.5">
              {footerLogoError ? (
                <span className="font-display text-xs font-bold tracking-tight text-[#102d40]">
                  NexaERP <span className="text-[#087c72]">AI</span>
                </span>
              ) : (
                <img
                  src={BRAND_LOGO_SRC}
                  alt="NexaERP AI"
                  width={72}
                  height={30}
                  referrerPolicy="no-referrer"
                  onError={() => setFooterLogoError(true)}
                  className="block h-[26px] w-[62px] object-contain"
                />
              )}
            </span>
            <span className="text-[#c5dad4]">
              NexaERP AI · SME operations & demand forecasting · NED University CS&IT Group 14
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#9cc5bb]">
            <span>
              Active workspace: {activeTenant.name} ({activeTenant.city})
            </span>
            <button
              type="button"
              onClick={onExitWorkspace}
              className="font-semibold text-[#e2ece9] underline underline-offset-4 hover:text-[#9ee2cf] cursor-pointer"
            >
              Concept site
            </button>
            <button
              type="button"
              onClick={() => setProposalOpen(true)}
              className="font-semibold text-[#75cbb0] underline underline-offset-4 hover:text-[#9ee2cf] cursor-pointer"
            >
              Platform scope
            </button>
          </div>
        </div>
      </footer>

      <ProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        onViewConceptSite={onExitWorkspace}
      />
    </>
  );
}
