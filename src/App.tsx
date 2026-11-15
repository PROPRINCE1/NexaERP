import { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProjectSection } from './components/ProjectSection';
import { PurposeSection } from './components/PurposeSection';
import { ReactiveBackground } from './components/ReactiveBackground';
import { ServicesSection } from './components/ServicesSection';
import { TeamSection } from './components/TeamSection';

export default function App() {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-[#d8e6df] text-[#1b3544]">
        <ReactiveBackground />
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-40 rounded-[4px] bg-[#0a2232] px-4 py-2.5 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>

        <Header />

        <main id="main">
          <HeroSection />
          <AboutSection />
          <PurposeSection />
          <TeamSection />
          <ServicesSection onJumpToWorkflowStep={setSelectedWorkflowStep} />
          <ProjectSection
            selectedStepIndex={selectedWorkflowStep}
            onSelectStepIndex={setSelectedWorkflowStep}
          />
          <ContactSection />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
