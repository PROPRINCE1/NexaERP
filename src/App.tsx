import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ErpWorkspace } from './components/erp/ErpWorkspace';
import type { WorkspaceViewId } from './components/erp/TopNavbar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProjectSection } from './components/ProjectSection';
import { PurposeSection } from './components/PurposeSection';
import { ReactiveBackground } from './components/ReactiveBackground';
import { ServicesSection } from './components/ServicesSection';
import { TeamSection } from './components/TeamSection';

type AppMode = 'landing' | 'workspace';

const WORKSPACE_VIEWS: WorkspaceViewId[] = [
  'overview',
  'inventory',
  'transactions',
  'forecast',
  'access',
];

function parseInitialRoute(): { mode: AppMode; view: WorkspaceViewId } {
  if (typeof window === 'undefined') {
    return { mode: 'landing', view: 'overview' };
  }
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'workspace' || hash.startsWith('workspace/')) {
    const subView = hash.split('/')[1] as WorkspaceViewId | undefined;
    if (subView && WORKSPACE_VIEWS.includes(subView)) {
      return { mode: 'workspace', view: subView };
    }
    return { mode: 'workspace', view: 'overview' };
  }
  return { mode: 'landing', view: 'overview' };
}

export default function App() {
  const initialRoute = parseInitialRoute();
  const [appMode, setAppMode] = useState<AppMode>(initialRoute.mode);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceViewId>(initialRoute.view);
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseInitialRoute();
      if (parsed.mode === 'workspace') {
        setAppMode('workspace');
        setWorkspaceView(parsed.view);
      } else if (!window.location.hash || window.location.hash === '#home') {
        setAppMode('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openWorkspace = (view: WorkspaceViewId = 'overview') => {
    setWorkspaceView(view);
    setAppMode('workspace');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#workspace/${view}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleSelectWorkspaceView = (view: WorkspaceViewId) => {
    setWorkspaceView(view);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#workspace/${view}`);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const openLanding = () => {
    setAppMode('landing');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#home');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen flex flex-col bg-[#d8e6df] text-[#1b3544]">
        <ReactiveBackground />

        {appMode === 'workspace' ? (
          <ErpWorkspace
            activeView={workspaceView}
            onSelectView={handleSelectWorkspaceView}
            onExitWorkspace={openLanding}
          />
        ) : (
          <>
            <a
              href="#main"
              className="fixed top-3 left-3 z-50 -translate-y-40 rounded-[4px] bg-[#0a2232] px-4 py-2.5 text-sm font-semibold text-white transition-transform focus:translate-y-0"
            >
              Skip to content
            </a>

            <Header onOpenWorkspace={openWorkspace} />

            <main id="main">
              <HeroSection onOpenWorkspace={openWorkspace} />
              <AboutSection />
              <PurposeSection />
              <TeamSection />
              <ServicesSection
                onJumpToWorkflowStep={setSelectedWorkflowStep}
                onOpenWorkspace={openWorkspace}
              />
              <ProjectSection
                selectedStepIndex={selectedWorkflowStep}
                onSelectStepIndex={setSelectedWorkflowStep}
                onOpenWorkspace={openWorkspace}
              />
              <ContactSection />
            </main>

            <Footer onOpenWorkspace={openWorkspace} />
          </>
        )}
      </div>
    </MotionConfig>
  );
}
