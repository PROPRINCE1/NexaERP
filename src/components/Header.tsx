import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'motion/react';
import { Menu, X } from 'lucide-react';
import { BRAND_LOGO_SRC, NAV_ITEMS } from '../data/nexaerpData';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const manualLockUntilRef = useRef<number>(0);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const scrolled = latest > 16;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  });

  const handleSelectNav = (sectionId: string) => {
    manualLockUntilRef.current = Date.now() + 900;
    setActiveSection(sectionId);
    setMenuOpen(false);
  };

  useEffect(() => {
    const sectionIds = ['home', ...NAV_ITEMS.map((item) => item.id), 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < manualLockUntilRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

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

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-30 text-white transition-[background-color,border-color,box-shadow] duration-200 ${
        isScrolled
          ? 'bg-[#081d2b]/95 backdrop-blur-md border-b border-[#75cbb0]/25 shadow-[0_8px_24px_rgba(3,18,27,0.32)]'
          : 'bg-[#0a2232] border-b border-white/10'
      }`}
    >
      <div className="mx-auto flex h-16 md:h-[72px] w-full max-w-[1320px] items-center justify-between gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand mark */}
        <a
          href="#home"
          aria-label="NexaERP AI home"
          onClick={() => handleSelectNav('home')}
          className="inline-flex shrink-0 items-center rounded-[3px] bg-white px-2 py-1 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-[#e0b85b] focus-visible:outline-offset-4"
        >
          {logoError ? (
            <span className="font-display text-sm sm:text-base font-bold tracking-tight text-[#102d40] whitespace-nowrap">
              NexaERP <span className="text-[#087c72]">AI</span>
            </span>
          ) : (
            <img
              src={BRAND_LOGO_SRC}
              alt="NexaERP AI"
              width={100}
              height={46}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="block h-[36px] sm:h-[40px] w-[82px] sm:w-[90px] object-contain"
            />
          )}
        </a>

        {/* Zone 2: 5 single-line reactive navigation links */}
        <nav
          className="hidden md:flex items-center md:gap-4 lg:gap-7"
          aria-label="Main navigation"
          onPointerLeave={() => setHoveredNavId(null)}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const isHovered = hoveredNavId === item.id;
            return (
              <motion.a
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => handleSelectNav(item.id)}
                onPointerEnter={() => setHoveredNavId(item.id)}
                onFocus={() => setHoveredNavId(item.id)}
                onBlur={() => setHoveredNavId((prev) => (prev === item.id ? null : prev))}
                whileTap={{ scale: 0.96 }}
                className={`relative inline-flex min-h-[44px] items-center px-1.5 whitespace-nowrap shrink-0 text-[13px] lg:text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-[#9ee2cf]'
                    : isHovered
                      ? 'text-white'
                      : 'text-[#e2ece9]'
                }`}
              >
                {isHovered && (
                  <motion.span
                    layoutId="nav-hover-backdrop"
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                    className="absolute -inset-x-1.5 inset-y-1.5 rounded-[4px] bg-white/[0.08] pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                <span className="relative z-10">{item.label}</span>

                {isHovered && !isActive && (
                  <motion.span
                    layoutId="nav-hover-underline"
                    transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                    className="absolute -left-2 -right-2 bottom-2 h-[2px] rounded-full bg-[#75cbb0]/45 pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{
                      layout: {
                        type: 'spring',
                        stiffness: 430,
                        damping: 15,
                        mass: 0.72,
                      },
                      type: 'spring',
                      stiffness: 430,
                      damping: 15,
                      mass: 0.72,
                    }}
                    className="absolute -left-2.5 -right-2.5 bottom-1.5 h-[2.5px] rounded-full bg-[#75cbb0] pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary header action + Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.a
            href="#contact"
            onClick={() => handleSelectNav('contact')}
            whileTap={{ scale: 0.97 }}
            aria-current={activeSection === 'contact' ? 'location' : undefined}
            className={`hidden md:inline-flex min-h-[40px] items-center justify-center rounded-[4px] border px-3.5 lg:px-4 py-2 text-[13px] lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
              activeSection === 'contact'
                ? 'border-[#75cbb0] bg-[#087c72] text-white'
                : 'border-[#75cbb0]/40 bg-[#102d40] text-[#e6f4ef] hover:bg-[#087c72] hover:border-[#087c72] hover:text-white'
            }`}
          >
            Contact
          </motion.a>

          <button
            ref={toggleBtnRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-[4px] border border-white/25 text-white transition-colors hover:bg-white/10 active:scale-95 cursor-pointer"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Overlay mobile drawer so header bar never exceeds mobile sticky height cap */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-b border-white/15 bg-[#0a2232] px-4 sm:px-6 pb-4 pt-2 shadow-[0_18px_40px_rgba(3,18,27,0.45)]"
          >
            <div className="flex flex-col">
              {[...NAV_ITEMS, { id: 'contact', label: 'Contact', href: '#contact' }].map(
                (item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => handleSelectNav(item.id)}
                      className={`flex min-h-[48px] items-center justify-between border-b border-white/10 text-sm font-medium last:border-b-0 transition-colors ${
                        isActive ? 'text-[#9ee2cf]' : 'text-[#e2ece9] hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="font-mono text-xs text-[#75cbb0]">Current</span>
                      )}
                    </a>
                  );
                },
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Reactive scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="h-[3px] w-full origin-left bg-[#7ed2bc] pointer-events-none"
        aria-hidden="true"
      />
    </header>
  );
}
