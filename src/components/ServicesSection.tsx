import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { SERVICE_CAPABILITIES } from '../data/nexaerpData';
import { getWorkflowStepIndexForCapability } from '../utils/nexaerpLogic';
import { EASE_OUT_EXPO, SectionReveal } from './MotionPrimitives';

interface ServicesSectionProps {
  onJumpToWorkflowStep?: (stepIndex: number) => void;
}

export function ServicesSection({ onJumpToWorkflowStep }: ServicesSectionProps) {
  const [selectedCode, setSelectedCode] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  const featuredService = SERVICE_CAPABILITIES.find((s) => s.featured)!;
  const secondaryServices = SERVICE_CAPABILITIES.filter((s) => !s.featured);
  const selectedService =
    SERVICE_CAPABILITIES.find((s) => s.code === selectedCode) ?? featuredService;

  const handleJumpToWorkflow = () => {
    const stepIndex = getWorkflowStepIndexForCapability(selectedService.code);
    onJumpToWorkflowStep?.(stepIndex);
    const projectEl = document.getElementById('proposed-project');
    projectEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative bg-[#cadbd3]/80 py-14 sm:py-20 lg:py-26 scroll-mt-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_0.58fr] lg:gap-14 mb-10 lg:mb-12">
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wide text-[#075e58]">
                Planned capabilities
              </p>
              <h2
                id="services-title"
                className="max-w-[680px] text-[clamp(1.75rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#102d40] text-balance"
              >
                A connected view of routine work.
              </h2>
            </div>
            <p className="max-w-[460px] text-[15px] leading-[1.72] text-[#40545e]">
              These are proposed capabilities for a future project. None are currently available as
              a working service.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:gap-14">
            {/* Featured Capability A */}
            <button
              type="button"
              onClick={() => setSelectedCode(featuredService.code)}
              aria-pressed={selectedCode === featuredService.code}
              className={`group flex min-h-[240px] sm:min-h-[280px] lg:min-h-[340px] flex-col justify-between bg-[#102d40] p-5 sm:p-7 text-left text-white transition-all duration-150 cursor-pointer ${
                selectedCode === featuredService.code
                  ? 'ring-2 ring-[#087c72] ring-offset-2 ring-offset-[#f7f8f4]'
                  : 'hover:bg-[#13364c]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-mono text-[#9bc7ba]">{featuredService.code}</span>
                  <span className="text-[#cde6de]">Proposed</span>
                </div>
                <h3 className="mt-6 sm:mt-8 lg:mt-10 max-w-[300px] text-2xl sm:text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
                  {featuredService.title}
                </h3>
                <p className="mt-3 sm:mt-4 max-w-[320px] text-sm leading-[1.7] text-[#d2e0dc]">
                  {featuredService.description}
                </p>
              </div>

              {/* Clean architectural lines representing stock rows */}
              <div className="mt-6 grid gap-2 pt-3" aria-hidden="true">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="grid h-[20px] grid-cols-[1.3fr_0.55fr_0.65fr_44px] items-center gap-2.5 border-b border-white/20"
                  >
                    <span className="block h-1 w-[68%] rounded-[2px] bg-[#d2ebe0]/70" />
                    <span className="block h-1 rounded-[2px] bg-[#d2ebe0]/40" />
                    <span className="block h-1 rounded-[2px] bg-[#d2ebe0]/40" />
                    <span className="block h-1.5 rounded-[2px] bg-[#71bda7]" />
                  </div>
                ))}
              </div>
            </button>

            {/* Capabilities B - E */}
            <div className="border border-[#b0c6bc] bg-[#fbfcfa]">
              {secondaryServices.map((service) => {
                const isSelected = selectedCode === service.code;
                return (
                  <button
                    key={service.code}
                    type="button"
                    onClick={() => setSelectedCode(service.code)}
                    aria-pressed={isSelected}
                    className={`grid w-full grid-cols-[26px_1fr] sm:grid-cols-[30px_1fr] gap-3 sm:gap-4 border-b last:border-b-0 border-[#dce7e1] px-4 py-4 sm:py-5 text-left transition-colors duration-150 cursor-pointer ${
                      isSelected ? 'bg-[#e7f1ec]' : 'hover:bg-[#f2f7f4]'
                    }`}
                  >
                    <span className="pt-0.5 font-mono text-xs font-bold text-[#075e58]">
                      {service.code}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base sm:text-[17px] font-bold tracking-[-0.015em] text-[#102d40]">
                          {service.title}
                        </h3>
                        <span className="text-xs font-semibold text-[#2b625b]">Proposed</span>
                      </div>
                      <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.65] text-[#40545e]">
                        {service.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reactive capability context bar synced with Workflow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedService.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              aria-live="polite"
              className="mt-6 flex flex-col justify-between gap-4 rounded-[4px] border border-[#cde0d8] bg-white px-4 py-4 sm:px-5 lg:flex-row lg:items-center"
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 text-xs leading-relaxed text-[#334e58]">
                <span>
                  <span className="font-mono font-bold text-[#075e58] mr-1.5">
                    Capability {selectedService.code}
                  </span>
                  <span className="font-semibold text-[#102d40]">{selectedService.title}</span>
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-[#9ab5ab]">
                  ·
                </span>
                <span>
                  Connects to workflow:{' '}
                  <strong className="font-semibold text-[#102d40]">
                    {selectedService.connectedWorkflowSteps.join(' -> ')}
                  </strong>
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-[#9ab5ab]">
                  ·
                </span>
                <span className="text-[#4b6568]">
                  Proposed alignment:{' '}
                  <strong className="font-semibold text-[#102d40]">
                    {selectedService.proposedLead}
                  </strong>
                </span>
              </div>

              {onJumpToWorkflowStep && (
                <button
                  type="button"
                  onClick={handleJumpToWorkflow}
                  className="inline-flex min-h-[42px] sm:min-h-[38px] items-center justify-center gap-1.5 rounded-[3px] border border-[#087c72] bg-[#f0f7f3] px-3.5 py-2 text-xs font-semibold text-[#075e58] whitespace-nowrap shrink-0 transition-colors hover:bg-[#087c72] hover:text-white cursor-pointer"
                >
                  <span>Open in workflow</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <p className="mt-6 rounded-[4px] border border-[#aac2b6] bg-[#d8e6df] px-4 py-3 text-[13px] leading-[1.65] text-[#253f44]">
            An assistant that explains charts is a possible later extension, dependent on reliable
            records and permissions.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
