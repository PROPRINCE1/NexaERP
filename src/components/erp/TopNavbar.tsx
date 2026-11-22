import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'motion/react';
import { ArrowLeft, Info, Menu, Plus, RotateCcw, X } from 'lucide-react';
import {
  BRAND_LOGO_SRC,
  ROLES,
  TENANTS,
  type TenantOrganization,
  type UserRole,
} from '../../data/erpSeedData';
import { ReactiveButton, SPRING_TACTILE } from '../MotionPrimitives';

export type WorkspaceViewId =
  | 'overview'
  | 'inventory'
  | 'transactions'
  | 'forecast'
  | 'access';

interface TopNavbarProps {
  activeView: WorkspaceViewId;
  onSelectView: (view: WorkspaceViewId) => void;
  activeTenant: TenantOrganization;
  onChangeTenant: (tenantId: string) => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  lowStockCount: number;
  flaggedCount: number;
  onOpenProposal: () => void;
  onResetWorkspace: () => void;
  onExitWorkspace: () => void;
}

export function TopNavbar({
  activeView,
  onSelectView,
  activeTenant,
  onChangeTenant,
  activeRole,
  onChangeRole,
  lowStockCount,
  flaggedCount,
  onOpenProposal,
  onResetWorkspace,
  onExitWorkspace,
}: TopNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<WorkspaceViewId | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const scrolled = latest > 12;
    if (scrolled !== isScrolled) setIsScrolled(scrolled);
  });

  const navItems: { id: WorkspaceViewId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'inventory', label: 'Inventory', count: lowStockCount },
    { id: 'transactions', label: 'Transactions', count: flaggedCount },
    { id: 'forecast', label: 'Forecasts' },
    { id: 'access', label: 'Access & Audit' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuOpen &&
        headerRef.current &&
        event.target instanceof Node &&
        !headerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

  const handleSelectNav = (view: WorkspaceViewId) => {
    onSelectView(view);
    setMenuOpen(false);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-30 text-[#eef5f1] transition-[background-color,border-color,box-shadow] duration-200 ${
          isScrolled
            ? 'bg-[#081d2b]/95 backdrop-blur-md border-b border-[#75cbb0]/25 shadow-[0_8px_24px_rgba(3,18,27,0.32)]'
            : 'bg-[#0a2232] border-b border-white/10'
        }`}
      >
        <div className="mx-auto flex h-16 md:h-[70px] w-full max-w-[1320px] items-center justify-between gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand mark */}
          <motion.button
            type="button"
            aria-label="NexaERP AI overview"
            onClick={() => handleSelectNav('overview')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={SPRING_TACTILE}
            className="inline-flex shrink-0 items-center rounded-[4px] bg-[#e9f2ed] px-2 py-1 cursor-pointer"
          >
            {logoError ? (
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-[#102d40] whitespace-nowrap">
                NexaERP <span className="text-[#087c72]">AI</span>
              </span>
            ) : (
              <img
                src={BRAND_LOGO_SRC}
                alt="NexaERP AI"
                width={96}
                height={42}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="block h-[34px] sm:h-[38px] w-[78px] sm:w-[86px] object-contain"
              />
            )}
          </motion.button>

          {/* Zone 2: 5 single-line reactive navigation tabs (landing-page spring physics) */}
          <nav
            className="hidden md:flex items-center md:gap-3 lg:gap-6"
            aria-label="Workspace navigation"
            onPointerLeave={() => setHoveredNavId(null)}
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const isHovered = hoveredNavId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectNav(item.id)}
                  onPointerEnter={() => setHoveredNavId(item.id)}
                  onFocus={() => setHoveredNavId(item.id)}
                  onBlur={() => setHoveredNavId((prev) => (prev === item.id ? null : prev))}
                  whileTap={{ scale: 0.95 }}
                  className={`relative inline-flex min-h-[44px] items-center gap-1.5 px-2 whitespace-nowrap shrink-0 text-[13px] lg:text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#9ee2cf] font-semibold'
                      : isHovered
                        ? 'text-[#f2f8f5]'
                        : 'text-[#d8e7e3]'
                  }`}
                >
                  {isHovered && (
                    <motion.span
                      layoutId="workspace-nav-hover"
                      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                      className="absolute -inset-x-1.5 inset-y-1.5 rounded-[4px] bg-white/[0.09] pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`relative z-10 font-mono text-[11px] font-bold tabular-nums ${
                        isActive ? 'text-[#75cbb0]' : 'text-[#9cc5bb]'
                      }`}
                    >
                      ({item.count})
                    </span>
                  )}

                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="workspace-nav-hover-underline"
                      transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                      className="absolute -left-1.5 -right-1.5 bottom-2 h-[2px] rounded-full bg-[#75cbb0]/45 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  {isActive && (
                    <motion.span
                      layoutId="workspace-nav-active-underline"
                      transition={{
                        type: 'spring',
                        stiffness: 430,
                        damping: 18,
                        mass: 0.72,
                      }}
                      className="absolute -left-1.5 -right-1.5 bottom-1.5 h-[2.5px] rounded-full bg-[#75cbb0] pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary header action + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <ReactiveButton
              type="button"
              onClick={() => handleSelectNav('transactions')}
              className="hidden md:inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[4px] bg-[#087c72] px-3.5 lg:px-4 py-2 text-[13px] lg:text-sm font-semibold text-[#f3faf7] whitespace-nowrap shrink-0 hover:bg-[#0a8f83] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record entry</span>
            </ReactiveButton>

            <motion.button
              ref={toggleBtnRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-workspace-nav"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              whileTap={{ scale: 0.94 }}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-[4px] border border-white/25 text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-workspace-nav"
              aria-label="Mobile workspace navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden absolute inset-x-0 top-full z-40 border-t border-b border-white/15 bg-[#0a2232] px-4 sm:px-6 pb-4 pt-2 shadow-[0_18px_40px_rgba(3,18,27,0.45)]"
            >
              <div className="flex flex-col">
                {navItems.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => handleSelectNav(item.id)}
                      className={`flex min-h-[46px] items-center justify-between border-b border-white/10 text-left text-sm font-medium last:border-b-0 cursor-pointer ${
                        isActive ? 'text-[#9ee2cf] font-semibold' : 'text-[#e2ece9]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span className="font-mono text-xs text-[#75cbb0] tabular-nums">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onExitWorkspace();
                  }}
                  className="mt-2 flex min-h-[46px] items-center justify-between border-t border-white/15 pt-1 text-left text-sm font-semibold text-[#9ee2cf] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to concept site
                  </span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Reactive scroll progress bar replacing browser scrollbar */}
        <motion.div
          style={{ scaleX }}
          className="h-[3px] w-full origin-left bg-[#7ed2bc] pointer-events-none"
          aria-hidden="true"
        />
      </header>

      {/* Deep-Navy Landing-Matched Operational Context Band */}
      <div className="relative overflow-hidden bg-[#102d40] text-[#e7f1ed] border-b border-[#0a2232]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-[240px] w-[240px] rounded-full border border-[#7ed2bc]/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-[220px] w-[220px] rounded-full border border-[#7ed2bc]/10"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="tenant-switcher"
                className="text-[11px] font-semibold text-[#9ee2cf] whitespace-nowrap"
              >
                Organization
              </label>
              <select
                id="tenant-switcher"
                value={activeTenant.id}
                onChange={(e) => onChangeTenant(e.target.value)}
                className="min-h-[34px] rounded-[4px] border border-[#75cbb0]/30 bg-[#0a2232] px-2.5 py-1 text-xs font-semibold text-[#eef5f1] cursor-pointer hover:border-[#75cbb0]"
              >
                {TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="role-switcher"
                className="text-[11px] font-semibold text-[#9ee2cf] whitespace-nowrap"
              >
                Role
              </label>
              <select
                id="role-switcher"
                value={activeRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="min-h-[34px] rounded-[4px] border border-[#75cbb0]/30 bg-[#0a2232] px-2.5 py-1 text-xs font-semibold text-[#eef5f1] cursor-pointer hover:border-[#75cbb0]"
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="hidden xl:block text-xs text-[#b8d2cb]">
              {activeTenant.sector} · {ROLES[activeRole].summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ReactiveButton
              type="button"
              onClick={onExitWorkspace}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[4px] border border-[#75cbb0]/35 bg-[#0a2232]/85 px-3 py-1 text-xs font-semibold text-[#9ee2cf] hover:border-[#75cbb0] hover:bg-[#0a2232] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Concept site</span>
            </ReactiveButton>

            <ReactiveButton
              type="button"
              onClick={onOpenProposal}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[4px] border border-white/20 bg-[#0a2232]/70 px-3 py-1 text-xs font-semibold text-[#dff0eb] hover:border-[#75cbb0]/50 hover:bg-[#0a2232] cursor-pointer"
            >
              <Info className="h-3.5 w-3.5 text-[#75cbb0]" />
              <span>Platform scope</span>
            </ReactiveButton>

            <ReactiveButton
              type="button"
              onClick={onResetWorkspace}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[4px] border border-white/20 bg-[#0a2232]/70 px-3 py-1 text-xs font-semibold text-[#cde3dd] hover:border-[#75cbb0]/50 hover:bg-[#0a2232] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#9ee2cf]" />
              <span>Reset data</span>
            </ReactiveButton>
          </div>
        </div>
      </div>
    </>
  );
}
