import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { HERO_SAMPLE_ITEMS } from '../data/nexaerpData';
import {
  evaluateInventoryItems,
  filterEvaluatedInventory,
  type InventoryFilter,
} from '../utils/nexaerpLogic';
import type { WorkspaceViewId } from './erp/TopNavbar';
import { EASE_OUT_EXPO, HeroReveal } from './MotionPrimitives';

interface HeroSectionProps {
  onOpenWorkspace: (view?: WorkspaceViewId) => void;
}

export function HeroSection({ onOpenWorkspace }: HeroSectionProps) {
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [selectedItemId, setSelectedItemId] = useState<string>('oil');

  const evaluatedItems = useMemo(() => evaluateInventoryItems(HERO_SAMPLE_ITEMS), []);
  const visibleItems = useMemo(
    () => filterEvaluatedInventory(evaluatedItems, filter),
    [evaluatedItems, filter],
  );
  const selectedItem =
    evaluatedItems.find((item) => item.id === selectedItemId) ?? evaluatedItems[0];

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[#102d40] text-white"
    >
      {/* Subtle architectural rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -left-24 h-[340px] w-[340px] sm:h-[390px] sm:w-[390px] rounded-full border border-[#7ed2bc]/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[103px] -left-9 h-[220px] w-[220px] sm:h-[264px] sm:w-[264px] rounded-full border border-[#7ed2bc]/10"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-[560px]">
          <HeroReveal delay={0.04}>
            <p className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#c8ddd9]">
              <span>Student venture</span>
              <span aria-hidden="true">/</span>
              <span>Concept under development</span>
            </p>
          </HeroReveal>

          <HeroReveal delay={0.1}>
            <h1
              id="hero-title"
              className="max-w-[540px] text-[clamp(2.125rem,5.4vw,4.35rem)] font-bold leading-[1.03] tracking-[-0.04em] text-white text-balance"
            >
              A clearer view of everyday business.
            </h1>
          </HeroReveal>

          <HeroReveal delay={0.16}>
            <p className="mt-4 sm:mt-6 max-w-[440px] text-lg sm:text-xl font-semibold leading-snug tracking-[-0.02em] text-[#a4d8c8]">
              Practical operations intelligence for growing Pakistani businesses.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.22}>
            <p className="mt-3.5 sm:mt-4 max-w-[480px] text-sm sm:text-base leading-[1.7] text-[#d6e1e2]">
              NexaERP AI is a proposed student venture exploring how routine stock, sales and
              purchasing records could work together to help small teams make informed decisions.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.28}>
            <div className="mt-6 sm:mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
              <button
                type="button"
                onClick={() => onOpenWorkspace('overview')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[4px] bg-[#eff8f2] px-5 py-3 text-sm font-bold text-[#0a2232] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#c7e9dc] cursor-pointer"
              >
                <span>Open interactive ERP</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#services"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[4px] border border-[#75cbb0]/40 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-[#e6f4ef] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-white/[0.14]"
              >
                Explore proposed services
              </a>
              <a
                href="#proposed-project"
                className="inline-flex min-h-[44px] items-center justify-center sm:justify-start text-sm font-semibold text-[#e1efea] underline decoration-1 underline-offset-5 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#9ee2cf]"
              >
                View the project concept
              </a>
            </div>
          </HeroReveal>
        </div>

        <HeroReveal delay={0.18} yOffset={22} className="w-full max-w-[580px] lg:ml-auto">
          <figure>
            <figcaption className="mb-2.5 sm:mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#d5eae3]">
              <span>Concept mockup</span>
              <span className="text-[#9ee2cf]">Synthetic example data</span>
            </figcaption>

            <div className="overflow-hidden rounded-[6px] border border-[#e6f2ed]/45 bg-white text-[#1b3544] shadow-[0_22px_65px_rgba(3,18,27,0.24)]">
              <div className="flex min-h-[48px] sm:min-h-[50px] items-center justify-between gap-3 border-b border-[#e7ece9] bg-[#fbfcfa] px-4 sm:px-5">
                <span className="font-display text-[13px] font-bold tracking-tight text-[#102d40]">
                  NexaERP <span className="text-[11px] text-[#087c72]">AI</span>
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace('overview')}
                    className="inline-flex items-center gap-1 rounded-[3px] border border-[#cde0d8] bg-[#eff7f3] px-2.5 py-1 text-[11px] font-semibold text-[#075e58] transition-colors hover:bg-[#087c72] hover:text-white cursor-pointer"
                  >
                    <span>Try live workspace</span>
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 place-items-center rounded-[3px] bg-[#dcece6] font-mono text-[10px] font-bold text-[#075e58]"
                  >
                    NO
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-0.5 text-[11px] font-semibold text-[#5c706f]">
                      Operations snapshot
                    </p>
                    <h2 className="text-base sm:text-[17px] font-bold tracking-tight text-[#1b3544]">
                      A view across your records
                    </h2>
                  </div>

                  {/* Interactive synthetic filter control with 44px mobile touch targets */}
                  <div
                    role="group"
                    aria-label="Filter sample items"
                    className="grid grid-cols-2 sm:inline-flex items-center gap-1 rounded-[4px] border border-[#dfe8e3] bg-[#f4f7f5] p-1"
                  >
                    {(
                      [
                        { id: 'all', label: 'All sample items' },
                        { id: 'review', label: 'Needs review' },
                      ] as const
                    ).map((option) => {
                      const active = filter === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFilter(option.id)}
                          aria-pressed={active}
                          className={`min-h-[40px] sm:min-h-[34px] rounded-[3px] px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                            active
                              ? 'bg-white text-[#102d40] shadow-xs'
                              : 'text-[#4f6468] hover:text-[#102d40]'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 rounded-[4px] border border-[#e2e9e5] bg-[#fbfcfa] px-3 py-2.5">
                    <span className="text-[11px] font-semibold text-[#53676b]">Stock records</span>
                    <strong className="row-span-2 font-mono text-xl sm:text-[22px] font-bold tracking-tight text-[#102d40] tabular-nums">
                      128
                    </strong>
                    <small className="text-[10px] text-[#6a7c7c]">Items in sample list</small>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 rounded-[4px] border border-[#e2e9e5] bg-[#fbfcfa] px-3 py-2.5">
                    <span className="text-[11px] font-semibold text-[#53676b]">Needs a review</span>
                    <strong className="row-span-2 font-mono text-xl sm:text-[22px] font-bold tracking-tight text-[#102d40] tabular-nums">
                      06
                    </strong>
                    <small className="text-[10px] text-[#6a7c7c]">Below sample threshold</small>
                  </div>
                </div>

                <div className="mt-4">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Illustrative sample inventory</caption>
                    <thead>
                      <tr className="border-b border-[#edf0ed] text-[10px] font-semibold text-[#6a797b]">
                        <th scope="col" className="pb-2 pl-2.5 pr-2">
                          Sample item
                        </th>
                        <th scope="col" className="pb-2 px-2">
                          On hand
                        </th>
                        <th scope="col" className="pb-2 pl-2 pr-2.5 text-right">
                          Record
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false} mode="popLayout">
                        {visibleItems.map((item) => {
                          const isSelected = selectedItem.id === item.id;
                          return (
                            <motion.tr
                              key={item.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                              className={`border-b border-[#edf0ed] last:border-b-0 transition-colors ${
                                isSelected ? 'bg-[#edf5f1]' : 'hover:bg-[#f7faf8]'
                              }`}
                            >
                              <td className="py-1.5 pl-2.5 pr-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedItemId(item.id)}
                                  aria-pressed={isSelected}
                                  className="inline-flex min-h-[40px] items-center text-left text-xs font-semibold text-[#263f4a] hover:text-[#075e58] cursor-pointer"
                                >
                                  {item.name}
                                </button>
                              </td>
                              <td className="py-1.5 px-2 font-mono text-[11px] sm:text-xs text-[#455b63] tabular-nums whitespace-nowrap">
                                {item.onHand} {item.unit}
                              </td>
                              <td className="py-1.5 pl-2 pr-2.5 text-right whitespace-nowrap">
                                <span
                                  className={`text-[11px] font-bold ${
                                    item.needsReview ? 'text-[#8d5f1d]' : 'text-[#276f5f]'
                                  }`}
                                >
                                  {item.statusLabel}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Reactive detail readout for selected synthetic item */}
                <div
                  aria-live="polite"
                  className="mt-3 rounded-[4px] border border-[#dce7e1] bg-[#f6faf8] px-3 py-2.5 text-[11px] leading-relaxed text-[#3e575a]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[#102d40]">
                      {selectedItem.name} ({selectedItem.category})
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#075e58] tabular-nums">
                      Showing {visibleItems.length} of {evaluatedItems.length} sample rows
                    </span>
                  </div>
                  <p>{selectedItem.note}</p>
                </div>

                <p className="mt-3 text-[11px] leading-snug text-[#637578]">
                  Illustration only. No business records or forecasts are connected.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-2.5 text-xs text-[#c7dad6]">
              <span aria-hidden="true" className="h-px w-6 shrink-0 bg-[#83ceb5]" />
              <span>A proposed view of organized records, not a live product</span>
            </div>
          </figure>
        </HeroReveal>
      </div>
    </section>
  );
}
