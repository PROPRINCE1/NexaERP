import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, Download, Shield, UserPlus, X } from 'lucide-react';
import {
  ROLES,
  type AuditEvent,
  type OrgUser,
  type ProductRecord,
  type TenantOrganization,
  type TransactionRecord,
  type UserRole,
} from '../../data/erpSeedData';
import { serializeToCsv } from '../../utils/erpEngine';
import { ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';

interface AccessAuditViewProps {
  tenant: TenantOrganization;
  activeRole: UserRole;
  users: OrgUser[];
  auditEvents: AuditEvent[];
  products: ProductRecord[];
  transactions: TransactionRecord[];
  onInviteUser: (input: { name: string; email: string; role: UserRole }) => string | null;
  onChangeUserRole: (userId: string, role: UserRole) => void;
  onLogExport: (datasetLabel: string, rowCount: number) => void;
}

const DEFAULT_VISIBLE_EVENTS = 6;

export function AccessAuditView({
  tenant,
  activeRole,
  users,
  auditEvents,
  products,
  transactions,
  onInviteUser,
  onChangeUserRole,
  onLogExport,
}: AccessAuditViewProps) {
  const [auditFilter, setAuditFilter] = useState<'all' | AuditEvent['category']>('all');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('sales_accounts');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);

  const canManageUsers = ROLES[activeRole].canManageUsers;
  const canExport = ROLES[activeRole].canExportData;

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((ev) => auditFilter === 'all' || ev.category === auditFilter);
  }, [auditEvents, auditFilter]);

  const visibleEvents = useMemo(() => {
    if (showAllEvents) return filteredEvents;
    return filteredEvents.slice(0, DEFAULT_VISIBLE_EVENTS);
  }, [filteredEvents, showAllEvents]);

  const triggerDownload = (filename: string, csvContent: string, datasetLabel: string, count: number) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onLogExport(datasetLabel, count);
    setExportNote(`Exported ${datasetLabel} (${count} rows) and recorded audit event.`);
  };

  const handleExportInventory = () => {
    const csv = serializeToCsv(
      ['sku', 'name', 'category', 'unit', 'on_hand', 'min_threshold', 'unit_cost_pkr', 'unit_price_pkr', 'lead_time_days', 'location'],
      products.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.unit,
        p.onHand,
        p.minThreshold,
        p.unitCostPkr,
        p.unitPricePkr,
        p.leadTimeDays,
        p.locationCode,
      ]),
    );
    triggerDownload(`${tenant.id}_inventory.csv`, csv, 'Inventory Register', products.length);
  };

  const handleExportTransactions = () => {
    const prodMap = new Map(products.map((p) => [p.id, p]));
    const csv = serializeToCsv(
      ['txn_code', 'date', 'type', 'sku', 'product', 'quantity', 'unit_price_pkr', 'location', 'quality_status', 'note'],
      transactions.map((t) => [
        t.txnCode,
        t.date,
        t.type,
        prodMap.get(t.productId)?.sku ?? t.productId,
        prodMap.get(t.productId)?.name ?? t.productId,
        t.quantity,
        t.unitPricePkr,
        t.locationCode,
        t.qualityStatus,
        t.referenceNote,
      ]),
    );
    triggerDownload(`${tenant.id}_transactions.csv`, csv, 'Transactions Ledger', transactions.length);
  };

  const handleExportAudit = () => {
    const csv = serializeToCsv(
      ['timestamp', 'actor', 'role', 'category', 'action', 'detail'],
      auditEvents.map((ev) => [
        ev.timestamp,
        ev.actorName,
        ROLES[ev.actorRole].label,
        ev.category,
        ev.action,
        ev.detail,
      ]),
    );
    triggerDownload(`${tenant.id}_audit_events.csv`, csv, 'Audit Trail', auditEvents.length);
  };

  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onInviteUser({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    if (err) {
      setInviteError(err);
      return;
    }
    setInviteError(null);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#075e58]">Governance & logs</p>
          <h1 className="mt-0.5 text-2xl sm:text-[28px] font-bold tracking-[-0.03em] text-[#102d40]">
            Access control, exports & audit trail
          </h1>
          <p className="mt-1 text-sm text-[#395157]">
            Organization-scoped permissions, recoverable CSV exports, and immutable operational audit events.
          </p>
        </div>

        <ReactiveButton
          type="button"
          disabled={!canManageUsers}
          onClick={() => {
            setInviteError(null);
            setShowInviteModal(true);
          }}
          title={canManageUsers ? 'Invite team member' : 'Switch to Administrator role to invite users'}
          className="inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-[4px] bg-[#087c72] px-4 py-2 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] disabled:cursor-not-allowed disabled:bg-[#b7c7c0] disabled:text-[#425856] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite user</span>
        </ReactiveButton>
      </div>

      {/* Tenant Isolation & Export Bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5 space-y-2 shadow-[0_6px_22px_rgba(16,45,64,0.05)]">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#087c72]" />
            <h2 className="text-sm font-bold text-[#102d40]">Tenant isolation boundary</h2>
          </div>
          <p className="text-xs text-[#395157] leading-relaxed">
            Active organization: <strong className="text-[#102d40]">{tenant.name}</strong> ({tenant.city}) · Tenant ID:{' '}
            <span className="font-mono text-[#075e58]">{tenant.id}</span>. All SKUs, ledger rows, forecasts, and audit logs are strictly scoped to this organization.
          </p>
        </div>

        <div className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5 space-y-3 shadow-[0_6px_22px_rgba(16,45,64,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#102d40]">Recoverable CSV exports</h2>
            {!canExport && (
              <span className="text-[11px] font-semibold text-[#8a5b14]">
                Restricted for Inventory Clerk
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <ReactiveButton
              type="button"
              disabled={!canExport}
              onClick={handleExportInventory}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-[#b7cdc2] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:border-[#087c72] hover:bg-[#d3e5dc] disabled:cursor-not-allowed disabled:text-[#788986] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#087c72]" />
              <span>Export Inventory</span>
            </ReactiveButton>
            <ReactiveButton
              type="button"
              disabled={!canExport}
              onClick={handleExportTransactions}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-[#b7cdc2] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:border-[#087c72] hover:bg-[#d3e5dc] disabled:cursor-not-allowed disabled:text-[#788986] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#087c72]" />
              <span>Export Transactions</span>
            </ReactiveButton>
            <ReactiveButton
              type="button"
              disabled={!canExport}
              onClick={handleExportAudit}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-[#b7cdc2] bg-[#dfece5] px-3 py-1.5 text-xs font-semibold text-[#102d40] hover:border-[#087c72] hover:bg-[#d3e5dc] disabled:cursor-not-allowed disabled:text-[#788986] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#087c72]" />
              <span>Export Audit Log</span>
            </ReactiveButton>
          </div>
          {exportNote && (
            <p role="status" className="text-[11px] font-semibold text-[#075e58]">
              {exportNote}
            </p>
          )}
        </div>
      </div>

      {/* Team & Role Matrix */}
      <section className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] overflow-hidden shadow-[0_8px_28px_rgba(16,45,64,0.06)]">
        <div className="border-b border-[#c8dbd1] px-4 py-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#102d40]">Organization users & roles</h2>
            <p className="text-xs text-[#4b6266]">
              {canManageUsers
                ? 'Administrator access active: you can update member roles or invite new staff.'
                : 'Switch to Administrator in the top bar to edit role assignments.'}
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-[#075e58] tabular-nums">
            {users.length} members
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#c8dbd1] bg-[#e0ece5] text-[11px] font-semibold text-[#4b6266]">
                <th scope="col" className="py-2.5 pl-4 pr-3">Name</th>
                <th scope="col" className="py-2.5 px-3">Email</th>
                <th scope="col" className="py-2.5 px-3">Role</th>
                <th scope="col" className="py-2.5 px-3">Status</th>
                <th scope="col" className="py-2.5 pl-3 pr-4 text-right">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1e1d9] text-xs">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-[#e1ede6]">
                  <td className="py-2.5 pl-4 pr-3 font-semibold text-[#102d40]">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#395157]">{u.email}</td>
                  <td className="py-2.5 px-3">
                    {canManageUsers ? (
                      <select
                        aria-label={`Role for ${u.name}`}
                        value={u.role}
                        onChange={(e) => onChangeUserRole(u.id, e.target.value as UserRole)}
                        className="min-h-[32px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-2 py-1 text-xs font-semibold text-[#102d40] cursor-pointer hover:border-[#087c72]"
                      >
                        {Object.values(ROLES).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-semibold text-[#102d40]">{ROLES[u.role].label}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 capitalize font-semibold text-[#075e58]">
                    {u.status}
                  </td>
                  <td className="py-2.5 pl-3 pr-4 text-right font-mono text-[11px] text-[#4b6266] tabular-nums">
                    {u.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Account Audit Trail */}
      <section className="rounded-[5px] border border-[#b7cdc2] bg-[#ebf3ee] p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_rgba(16,45,64,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#c8dbd1] pb-3.5">
          <div>
            <h2 className="text-base font-bold text-[#102d40]">Audit events</h2>
            <p className="text-xs text-[#4b6266]">
              Tracks inventory changes, CSV imports, forecast decisions, exports, and access updates.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter audit events"
            className="inline-flex flex-wrap items-center gap-1 self-start rounded-[5px] border border-[#b5cbc0] bg-[#e0ece5] p-1"
          >
            {(['all', 'inventory', 'transaction', 'forecast', 'access', 'export'] as const).map(
              (cat) => {
                const active = auditFilter === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setAuditFilter(cat);
                      setShowAllEvents(false);
                    }}
                    className={`relative min-h-[30px] rounded-[3px] px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active ? 'text-[#f3faf7]' : 'text-[#3d565b] hover:text-[#102d40]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="audit-filter-pill"
                        transition={SPRING_TACTILE}
                        className="absolute inset-0 rounded-[3px] bg-[#102d40]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </motion.button>
                );
              },
            )}
          </div>
        </div>

        <ul className="divide-y divide-[#d1e1d9] text-xs">
          {visibleEvents.length === 0 ? (
            <li className="py-6 text-center text-xs text-[#4b6266]">
              No audit events recorded for this category yet.
            </li>
          ) : (
            visibleEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-1 py-2.5 px-1.5 rounded-[3px] transition-colors hover:bg-[#e1ede6] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-[#4b6266] mr-2.5 tabular-nums">
                    {ev.timestamp}
                  </span>
                  <span className="font-bold text-[#102d40] mr-2">{ev.action}</span>
                  <span className="text-[#395157]">{ev.detail}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#075e58] shrink-0">
                  {ev.actorName} · {ROLES[ev.actorRole].shortLabel}
                </span>
              </li>
            ))
          )}
        </ul>

        {filteredEvents.length > DEFAULT_VISIBLE_EVENTS && (
          <div className="flex items-center justify-between border-t border-[#c8dbd1] pt-3 text-xs">
            <span className="font-mono text-[11px] text-[#4b6266] tabular-nums">
              Showing {visibleEvents.length} of {filteredEvents.length} events
            </span>
            <ReactiveButton
              type="button"
              onClick={() => setShowAllEvents((prev) => !prev)}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-3 py-1 text-[11px] font-semibold text-[#102d40] hover:border-[#087c72] hover:bg-[#d3e5dc] cursor-pointer"
            >
              {showAllEvents ? (
                <>
                  <span>Show fewer</span>
                  <ChevronUp className="h-3.5 w-3.5 text-[#087c72]" />
                </>
              ) : (
                <>
                  <span>Show older events ({filteredEvents.length - DEFAULT_VISIBLE_EVENTS})</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#087c72]" />
                </>
              )}
            </ReactiveButton>
          </div>
        )}
      </section>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-user-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#05141e]/65 backdrop-blur-[2px]"
              onClick={() => setShowInviteModal(false)}
              aria-hidden="true"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={SPRING_TACTILE}
              onSubmit={handleSubmitInvite}
              className="relative z-10 w-full max-w-[420px] rounded-[6px] border border-[#b7cdc2] bg-[#ebf3ee] p-5 shadow-xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#c8dbd1] pb-3">
                <h2 id="invite-user-title" className="text-base font-bold text-[#102d40]">
                  Invite staff member
                </h2>
                <ReactiveButton
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  aria-label="Close invite dialog"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] text-[#395157] hover:bg-[#d3e5dc] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </ReactiveButton>
              </div>

              <div>
                <label htmlFor="invite-name" className="block font-semibold text-[#102d40] mb-1">
                  Full name
                </label>
                <input
                  id="invite-name"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g., Usman Farooq"
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-2.5 text-[#102d40]"
                />
              </div>

              <div>
                <label htmlFor="invite-email" className="block font-semibold text-[#102d40] mb-1">
                  Work email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usman@alnoortraders.pk"
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-2.5 text-[#102d40]"
                />
              </div>

              <div>
                <label htmlFor="invite-role" className="block font-semibold text-[#102d40] mb-1">
                  Assigned role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-2.5 font-semibold text-[#102d40] cursor-pointer"
                >
                  {Object.values(ROLES).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {inviteError && <p className="font-semibold text-[#b42318]">{inviteError}</p>}

              <div className="flex justify-end gap-2 border-t border-[#c8dbd1] pt-3">
                <ReactiveButton
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="min-h-[36px] rounded-[4px] border border-[#b5cbc0] bg-[#dfece5] px-3.5 text-xs font-semibold text-[#395157] hover:bg-[#d3e5dc] cursor-pointer"
                >
                  Cancel
                </ReactiveButton>
                <ReactiveButton
                  type="submit"
                  className="min-h-[36px] rounded-[4px] bg-[#087c72] px-4 text-xs font-semibold text-[#f3faf7] hover:bg-[#075e58] cursor-pointer"
                >
                  Send invite
                </ReactiveButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
