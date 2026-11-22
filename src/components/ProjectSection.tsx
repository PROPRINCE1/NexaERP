import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FORECAST_REVIEW_CHECKS,
  HERO_SAMPLE_ITEMS,
  ROADMAP_MILESTONES,
  WORKFLOW_STEPS,
} from '../data/nexaerpData';
import { ArrowUpRight } from 'lucide-react';
import {
  evaluateInventoryItems,
  filterEvaluatedInventory,
  getKeyboardNavIndex,
  getNextStepIndex,
  getPreviousStepIndex,
  summarizeInventory,
  type InventoryFilter,
} from '../utils/nexaerpLogic';
import type { WorkspaceViewId } from './erp/TopNavbar';
import { EASE_OUT_EXPO, SectionReveal } from './MotionPrimitives';

type PreviewTabId = 'overview' | 'inventory' | 'forecast';

const PREVIEW_TABS: { id: PreviewTabId; label: string }[] = [
  { id: 'overview', label: 'Owner overview' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'forecast', label: 'Forecast review' },
];

interface ProjectSectionProps {
  selectedStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  onOpenWorkspace?: (view?: WorkspaceViewId) => void;
}

export function ProjectSection({
  selectedStepIndex,
  onSelectStepIndex,
  onOpenWorkspace,
}: ProjectSectionProps) {
  const workflowBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Preview Workbench state
  const [activeTab, setActiveTab] = useState<PreviewTabId>('overview');
  const tabBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reactive synthetic inventory state inside Workbench
  const [oilThreshold, setOilThreshold] = useState<number>(12);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('all');

  // Reactive forecast checklist state inside Workbench
  const [checkedForecastIds, setCheckedForecastIds] = useState<string[]>(['history']);

  // Roadmap milestone explorer state
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(ROADMAP_MILESTONES[0].id);

  const currentStep = WORKFLOW_STEPS[selectedStepIndex] ?? WORKFLOW_STEPS[0];

  const evaluatedInventory = useMemo(
    () => evaluateInventoryItems(HERO_SAMPLE_ITEMS, { oil: oilThreshold }),
    [oilThreshold],
  );
  const filteredInventory = useMemo(
    () => filterEvaluatedInventory(evaluatedInventory, inventoryFilter),
    [evaluatedInventory, inventoryFilter],
  );
  const inventorySummary = useMemo(
    () => summarizeInventory(evaluatedInventory),
    [evaluatedInventory],
  );

  const activeMilestone =
    ROADMAP_MILESTONES.find((m) => m.id === activeMilestoneId) ?? ROADMAP_MILESTONES[0];

  const handleWorkflowKeyDown = (event: React.KeyboardEvent, index: number) => {
    const nextIdx = getKeyboardNavIndex(event.key, index, WORKFLOW_STEPS.length, true);
    if (nextIdx === null) return;
    event.preventDefault();
    onSelectStepIndex(nextIdx);
    workflowBtnRefs.current[nextIdx]?.focus();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const nextIdx = getKeyboardNavIndex(event.key, index, PREVIEW_TABS.length, false);
    if (nextIdx === null) return;
    event.preventDefault();
    setActiveTab(PREVIEW_TABS[nextIdx].id);
    tabBtnRefs.current[nextIdx]?.focus();
  };

  const toggleForecastCheck = (id: string) => {
    setCheckedForecastIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <section
      id="proposed-project"
      aria-labelledby="project-title"
      className="relative bg-[#d8e6df]/75 py-14 sm:py-20 lg:py-26 scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_0.58fr] lg:gap-14 mb-10 lg:mb-12">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#075e58]">
                Proposed project
              </p>
              <h2
                id="project-title"
                className="max-w-[680px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#102d40] text-balance"
              >
                From a recorded sale to a considered decision.
              </h2>
            </div>
            <p className="max-w-[460px] text-[15px] leading-[1.72] text-[#40545e]">
              The concept aims to help small teams connect operational records while keeping people
              in control of what happens next.
            </p>
          </div>
        </SectionReveal>

        {/* Interactive 5-Step Workflow: compact 5-column strip on mobile & desktop */}
        <SectionReveal delay={0.08}>
          <ol
            aria-label="Proposed record-to-decision workflow"
            className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-0"
          >
            {WORKFLOW_STEPS.map((step, index) => {
              const isCurrent = index === selectedStepIndex;
              const isCompleted = index < selectedStepIndex;
              return (
                <li
                  key={step.id}
                  className={`relative border-t pt-3 pb-2 md:pr-4 transition-colors ${
                    isCurrent
                      ? 'border-t-2 border-[#087c72]'
                      : isCompleted
                        ? 'border-[#7eb3a2]'
                        : 'border-[#bdcec6]'
                  }`}
                >
                  <span
                    className={`block mb-1 font-mono text-[10px] sm:text-[11px] font-bold tabular-nums ${
                      isCurrent ? 'text-[#075e58]' : 'text-[#648880]'
                    }`}
                  >
                    {step.number}
                  </span>
                  <button
                    ref={(el) => {
                      workflowBtnRefs.current[index] = el;
                    }}
                    type="button"
                    aria-controls="workflow-detail"
                    aria-current={isCurrent ? 'step' : undefined}
                    onClick={() => onSelectStepIndex(index)}
                    onKeyDown={(e) => handleWorkflowKeyDown(e, index)}
                    className={`inline-flex min-h-[44px] sm:min-h-[40px] w-full items-center text-left text-[11px] sm:text-sm whitespace-nowrap transition-transform duration-150 md:hover:translate-x-0.5 cursor-pointer ${
                      isCurrent
                        ? 'font-bold text-[#075e58]'
                        : 'font-semibold text-[#102d40] hover:text-[#075e58]'
                    }`}
                  >
                    <span className="truncate">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            id="workflow-detail"
            aria-live="polite"
            aria-atomic="true"
            className="mt-2 grid grid-cols-1 items-center gap-4 sm:gap-5 border border-[#d0ddd6] bg-white p-4 sm:p-6 md:grid-cols-[0.55fr_1.45fr_auto]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                className="contents"
              >
                <div>
                  <p className="mb-1 font-mono text-[11px] font-bold text-[#075e58] tabular-nums">
                    Step {selectedStepIndex + 1} of {WORKFLOW_STEPS.length}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold tracking-[-0.03em] text-[#102d40]">
                    {currentStep.title}
                  </h3>
                </div>

                <div>
                  <p className="max-w-[590px] text-sm leading-[1.65] text-[#40545e]">
                    {currentStep.description}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#5c7470]">
                    Proposed capability link: {currentStep.relatedCapability}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2.5 pt-1 md:pt-0">
              <button
                type="button"
                disabled={selectedStepIndex === 0}
                onClick={() => onSelectStepIndex(getPreviousStepIndex(selectedStepIndex))}
                className="flex-1 md:flex-none min-h-[44px] rounded-[3px] border border-[#bdcec6] bg-white px-3.5 py-2 text-xs font-semibold text-[#102d40] whitespace-nowrap shrink-0 transition-colors hover:border-[#087c72] hover:bg-[#f0f7f3] hover:text-[#075e58] disabled:cursor-not-allowed disabled:bg-[#f0f3f1] disabled:text-[#788986] cursor-pointer"
              >
                Previous step
              </button>
              <button
                type="button"
                disabled={selectedStepIndex === WORKFLOW_STEPS.length - 1}
                onClick={() =>
                  onSelectStepIndex(getNextStepIndex(selectedStepIndex, WORKFLOW_STEPS.length))
                }
                className="flex-1 md:flex-none min-h-[44px] rounded-[3px] border border-[#075e58] bg-[#075e58] px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#064e49] disabled:cursor-not-allowed disabled:border-[#bdcec6] disabled:bg-[#f0f3f1] disabled:text-[#788986] cursor-pointer"
              >
                Next step
              </button>
            </div>
          </div>

          <p className="mt-2.5 mb-10 sm:mb-14 text-[11px] text-[#5a706e]">
            Explore the proposed sequence. No records are processed here.
          </p>
        </SectionReveal>

        {/* Interactive Preview Workbench */}
        <SectionReveal delay={0.1}>
          <div className="border border-[#d0ddd6] bg-white p-4 sm:p-7">
            <div className="flex flex-col justify-between gap-2.5 md:flex-row md:items-end">
              <div>
                <p className="mb-1 text-xs font-bold tracking-wide text-[#075e58]">
                  Illustrative interface
                </p>
                <h3 className="text-xl sm:text-[23px] font-bold tracking-[-0.03em] text-[#102d40]">
                  Three views the team plans to explore
                </h3>
              </div>
              <p className="max-w-[330px] text-xs leading-[1.6] text-[#476364]">
                Synthetic examples only. No live system, business records or forecasts are
                connected.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Concept mockup views"
              className="mt-5 sm:mt-6 flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto border-b border-[#dce5df]"
            >
              {PREVIEW_TABS.map((tab, index) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabBtnRefs.current[index] = el;
                    }}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={`relative inline-flex min-h-[46px] items-center justify-center sm:justify-start px-2 sm:px-3.5 py-2 text-[11px] sm:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isSelected ? 'text-[#075e58]' : 'text-[#53686a] hover:text-[#102d40]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isSelected && (
                      <motion.span
                        layoutId="workbench-active-tab"
                        transition={{ type: 'spring', stiffness: 450, damping: 36 }}
                        className="absolute right-1.5 sm:right-2 bottom-0 left-1.5 sm:left-2 h-[3px] bg-[#087c72]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[240px] py-5 sm:py-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    id="panel-overview"
                    role="tabpanel"
                    aria-labelledby="tab-overview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1e9e4] pb-3.5">
                      <div>
                        <span className="text-[11px] font-semibold text-[#607575]">
                          Concept mockup
                        </span>
                        <h4 className="mt-0.5 text-base sm:text-[17px] font-bold tracking-[-0.02em] text-[#102d40]">
                          Owner overview
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#35685c]">
                        Synthetic example data
                      </span>
                    </div>

                    <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="border border-[#e0e8e3] bg-[#fbfcfa] p-4">
                        <span className="block text-[11px] text-[#5c7072]">Stock to review</span>
                        <strong className="mt-1.5 mb-1 block font-mono text-lg font-bold text-[#102d40] tabular-nums">
                          {inventorySummary.reviewCount}{' '}
                          {inventorySummary.reviewCount === 1 ? 'item' : 'items'}
                        </strong>
                        <small className="block text-[11px] text-[#5c7072]">
                          Illustrative threshold queue (live from sample tab)
                        </small>
                      </div>

                      <div className="border border-[#e0e8e3] bg-[#fbfcfa] p-4">
                        <span className="block text-[11px] text-[#5c7072]">Sales records</span>
                        <strong className="mt-1.5 mb-1 block font-mono text-lg font-bold text-[#102d40] tabular-nums">
                          24 entries
                        </strong>
                        <small className="block text-[11px] text-[#5c7072]">
                          Illustrative sample list
                        </small>
                      </div>

                      <div className="border border-[#b7d5ca] bg-[#edf6f1] p-4">
                        <span className="block text-[11px] text-[#5c7072]">Next step</span>
                        <strong className="mt-1.5 mb-1 block text-sm font-bold leading-snug text-[#102d40]">
                          Check the source records
                        </strong>
                        <small className="block text-[11px] text-[#5c7072]">
                          People review the information before acting.
                        </small>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('inventory')}
                        className="min-h-[44px] sm:min-h-[40px] rounded-[3px] border border-[#c7d8cf] bg-white px-4 py-2 text-xs font-semibold text-[#075e58] hover:bg-[#f0f7f3] cursor-pointer"
                      >
                        Inspect sample inventory
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forecast')}
                        className="min-h-[44px] sm:min-h-[40px] rounded-[3px] border border-[#c7d8cf] bg-white px-4 py-2 text-xs font-semibold text-[#102d40] hover:bg-[#f0f7f3] cursor-pointer"
                      >
                        Open forecast review prompt
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'inventory' && (
                  <motion.div
                    key="inventory"
                    id="panel-inventory"
                    role="tabpanel"
                    aria-labelledby="tab-inventory"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1e9e4] pb-3.5">
                      <div>
                        <span className="text-[11px] font-semibold text-[#607575]">
                          Concept mockup
                        </span>
                        <h4 className="mt-0.5 text-base sm:text-[17px] font-bold tracking-[-0.02em] text-[#102d40]">
                          Inventory and item detail
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#35685c]">
                        Synthetic example data
                      </span>
                    </div>

                    {/* Instant reactive controls for synthetic example */}
                    <div className="mt-4 flex flex-col gap-3.5 rounded-[4px] border border-[#e0e8e3] bg-[#f8faf8] p-3.5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <label
                          htmlFor="oil-threshold-range"
                          className="text-xs font-semibold text-[#102d40]"
                        >
                          Sample threshold for Cooking oil (on hand: 8 cartons):
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id="oil-threshold-range"
                            type="range"
                            min={4}
                            max={20}
                            value={oilThreshold}
                            onChange={(e) => setOilThreshold(Number(e.target.value))}
                            className="h-6 flex-1 sm:w-32 accent-[#087c72] cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-[#075e58] tabular-nums shrink-0">
                            {oilThreshold} cartons
                          </span>
                        </div>
                      </div>

                      <div
                        role="group"
                        aria-label="Filter synthetic inventory rows"
                        className="grid grid-cols-3 sm:inline-flex gap-1 rounded-[4px] border border-[#d4dfda] bg-white p-1"
                      >
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'review', label: 'Check threshold' },
                            { id: 'in-range', label: 'In range' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={inventoryFilter === opt.id}
                            onClick={() => setInventoryFilter(opt.id)}
                            className={`min-h-[40px] sm:min-h-[34px] rounded-[3px] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                              inventoryFilter === opt.id
                                ? 'bg-[#eaf1ed] text-[#102d40]'
                                : 'text-[#53686a] hover:text-[#102d40]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desktop/tablet 4-column table */}
                    <div className="mt-3 hidden sm:block">
                      <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_130px] gap-3 border-b border-[#e9eeeb] py-2 text-[11px] font-semibold text-[#687a7b]">
                        <span>Sample item</span>
                        <span>On hand</span>
                        <span>Sample min</span>
                        <span className="text-right">Review status</span>
                      </div>
                      {filteredInventory.length === 0 ? (
                        <p className="py-6 text-center text-xs text-[#5c7072]">
                          No synthetic sample items match this filter.
                        </p>
                      ) : (
                        filteredInventory.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[minmax(0,1fr)_110px_110px_130px] items-center gap-3 border-b border-[#e9eeeb] py-3 text-xs text-[#405961]"
                          >
                            <span className="font-semibold text-[#102d40]">{item.name}</span>
                            <span className="font-mono tabular-nums">
                              {item.onHand} {item.unit}
                            </span>
                            <span className="font-mono text-[#5c7072] tabular-nums">
                              {item.activeThreshold} {item.unit}
                            </span>
                            <span
                              className={`text-right font-bold ${
                                item.needsReview ? 'text-[#865c20]' : 'text-[#28715f]'
                              }`}
                            >
                              {item.workbenchStatusLabel}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Zero-overflow mobile card list (< 640px) */}
                    <div className="mt-3 grid gap-2.5 sm:hidden">
                      {filteredInventory.length === 0 ? (
                        <p className="py-5 text-center text-xs text-[#5c7072]">
                          No synthetic sample items match this filter.
                        </p>
                      ) : (
                        filteredInventory.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[4px] border border-[#e5ece8] bg-[#fbfcfa] px-3.5 py-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#102d40]">{item.name}</span>
                              <span
                                className={`text-[11px] font-bold shrink-0 ${
                                  item.needsReview ? 'text-[#865c20]' : 'text-[#28715f]'
                                }`}
                              >
                                {item.workbenchStatusLabel}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-[#53686a] tabular-nums">
                              <span>
                                On hand: {item.onHand} {item.unit}
                              </span>
                              <span>
                                Sample min: {item.activeThreshold} {item.unit}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'forecast' && (
                  <motion.div
                    key="forecast"
                    id="panel-forecast"
                    role="tabpanel"
                    aria-labelledby="tab-forecast"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1e9e4] pb-3.5">
                      <div>
                        <span className="text-[11px] font-semibold text-[#607575]">
                          Concept mockup
                        </span>
                        <h4 className="mt-0.5 text-base sm:text-[17px] font-bold tracking-[-0.02em] text-[#102d40]">
                          Forecast review
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#35685c]">
                        No forecast calculated
                      </span>
                    </div>

                    <div className="mt-4 sm:mt-5 grid max-w-[820px] grid-cols-1 gap-4 sm:grid-cols-[42px_1fr] sm:gap-5">
                      <div
                        aria-hidden="true"
                        className="grid h-9 w-9 place-items-center rounded-full border border-[#c4d8ce] bg-[#edf5f0] font-display text-base font-bold text-[#075e58]"
                      >
                        ?
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold text-[#55736c]">
                          Illustrative review prompt
                        </p>
                        <h5 className="text-base sm:text-lg font-bold tracking-[-0.02em] text-[#102d40]">
                          What would need checking before a reorder suggestion?
                        </h5>
                        <p className="mt-2 max-w-[690px] text-[13px] leading-[1.65] text-[#40545e]">
                          A future forecast would need reliable transaction history and a baseline
                          comparison. A person would review the evidence before taking action.
                        </p>

                        <div className="mt-4 grid gap-2.5">
                          {FORECAST_REVIEW_CHECKS.map((check) => {
                            const checked = checkedForecastIds.includes(check.id);
                            return (
                              <label
                                key={check.id}
                                className={`flex min-h-[48px] items-start gap-3 rounded-[4px] border p-3.5 text-xs transition-colors cursor-pointer ${
                                  checked
                                    ? 'border-[#9ec7b8] bg-[#f0f7f3]'
                                    : 'border-[#e0e8e3] bg-[#fbfcfa] hover:bg-[#f4f7f5]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleForecastCheck(check.id)}
                                  className="mt-0.5 h-4 w-4 accent-[#087c72] cursor-pointer shrink-0"
                                />
                                <span>
                                  <strong className="block font-semibold text-[#102d40]">
                                    {check.label}
                                  </strong>
                                  <span className="mt-0.5 block text-[#4b6266]">
                                    {check.detail}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        <p className="mt-3 font-mono text-[11px] font-semibold text-[#075e58] tabular-nums">
                          Illustrative checks reviewed: {checkedForecastIds.length} of{' '}
                          {FORECAST_REVIEW_CHECKS.length}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e4ebe6] pt-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[#687a7b]">
                These panels demonstrate a possible interface only. They do not process or store
                information.
              </p>
              {onOpenWorkspace && (
                <button
                  type="button"
                  onClick={() => onOpenWorkspace(activeTab)}
                  className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[3px] bg-[#087c72] px-3.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#075e58] cursor-pointer"
                >
                  <span>Open live {activeTab} in ERP</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </SectionReveal>

        {/* Future FYP Roadmap */}
        <SectionReveal delay={0.12}>
          <div className="mt-12 sm:mt-16 border-t border-[#c8d7cf] pt-6 sm:pt-7">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
              <p className="text-xs font-bold tracking-wide text-[#075e58]">Future FYP roadmap</p>
              <p className="text-xs text-[#536a69]">
                An eight-month project outline from the proposal, not a launch schedule.
              </p>
            </div>

            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {ROADMAP_MILESTONES.map((milestone) => {
                const active = milestone.id === activeMilestoneId;
                return (
                  <button
                    key={milestone.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveMilestoneId(milestone.id)}
                    className={`flex min-h-[78px] sm:min-h-[86px] flex-col justify-between gap-2 border-t-2 px-3 pt-3 pb-2.5 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-[#075e58] bg-white'
                        : 'border-[#6fae9c] bg-white/40 hover:bg-white/75'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold text-[#4a726c] tabular-nums">
                      {milestone.period}
                    </span>
                    <strong className="text-xs sm:text-[13px] font-bold leading-snug text-[#102d40]">
                      {milestone.title}
                    </strong>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMilestone.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                aria-live="polite"
                className="mt-4 flex flex-col justify-between gap-2.5 rounded-[4px] border border-[#c8d7cf] bg-white px-4 py-3.5 sm:px-5 sm:py-4 lg:flex-row lg:items-center"
              >
                <div className="text-xs leading-relaxed text-[#334e58]">
                  <span className="font-mono font-bold text-[#075e58] mr-2">
                    {activeMilestone.period}
                  </span>
                  <strong className="text-[#102d40] mr-2">{activeMilestone.title}:</strong>
                  <span>{activeMilestone.focusSummary}</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#476364]">
                  {activeMilestone.linkedRoles.join(' · ')}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-6 sm:mt-8 text-xs leading-[1.7] text-[#536b6b]">
            The proposed MVP excludes payroll, tax filing, bank or payment processing, autonomous
            purchasing, complex manufacturing, credit decisions and model training.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
