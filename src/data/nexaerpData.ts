export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface SampleInventoryItem {
  id: string;
  name: string;
  onHand: number;
  unit: string;
  defaultThreshold: number;
  category: string;
  note: string;
}

export interface ProjectTarget {
  id: string;
  text: string;
  focus: 'discovery' | 'build' | 'security';
  focusLabel: string;
}

export interface TeamMember {
  id: string;
  name: string;
  studentId: string;
  designation: string;
  track: 'product-ux' | 'data-platform';
  skills: string;
  responsibilities: string;
  deliverables: string;
  objectives: string;
}

export interface ServiceCapability {
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  description: string;
  featured?: boolean;
  connectedWorkflowSteps: string[];
  proposedLead: string;
}

export interface WorkflowStep {
  id: string;
  number: string;
  title: string;
  description: string;
  relatedCapability: string;
}

export interface RoadmapMilestone {
  id: string;
  period: string;
  title: string;
  focusSummary: string;
  linkedRoles: string[];
}

export interface ForecastCheckItem {
  id: string;
  label: string;
  detail: string;
}

export const BRAND_LOGO_SRC = '/assets/aistudio/NexaERP_AI_connected_N_emblem_0af07304.png';

export const NAV_ITEMS: NavItem[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'vision-mission-objectives', label: 'Vision & goals', href: '#vision-mission-objectives' },
  { id: 'team', label: 'Team', href: '#team' },
  { id: 'services', label: 'Services', href: '#services' },
  { id: 'proposed-project', label: 'Project', href: '#proposed-project' },
];

export const HERO_SAMPLE_ITEMS: SampleInventoryItem[] = [
  {
    id: 'rice',
    name: 'Basmati rice, 5 kg',
    onHand: 48,
    unit: 'bags',
    defaultThreshold: 20,
    category: 'Staples',
    note: 'Sample quantity sits comfortably above the illustrative 20-bag threshold.',
  },
  {
    id: 'oil',
    name: 'Cooking oil, 1 L',
    onHand: 8,
    unit: 'cartons',
    defaultThreshold: 12,
    category: 'Pantry',
    note: 'Sample quantity is below the illustrative 12-carton threshold, flagging it for human review.',
  },
  {
    id: 'tea',
    name: 'Tea, 450 g',
    onHand: 24,
    unit: 'packs',
    defaultThreshold: 15,
    category: 'Beverages',
    note: 'Sample quantity sits above the illustrative 15-pack threshold.',
  },
];

export const AUDIENCE_BLOCKS = [
  {
    id: 'who-for',
    audience: 'decision-makers' as const,
    title: 'Who it is for',
    description:
      'Small Pakistani retail, wholesale and distribution businesses with repeated stock movements and disconnected operational records.',
  },
  {
    id: 'who-uses',
    audience: 'daily-staff' as const,
    title: 'Who might use it',
    description:
      'Owners and finance or operations managers could review reports; inventory, sales, accounts and store staff could maintain daily records.',
  },
];

export const PROJECT_TARGETS: ProjectTarget[] = [
  {
    id: 't1',
    text: 'Validate at least three user workflows through interviews before requirements freeze.',
    focus: 'discovery',
    focusLabel: 'Discovery & UX',
  },
  {
    id: 't2',
    text: 'Deliver a prototype covering four core workflows by the end of month 6.',
    focus: 'build',
    focusLabel: 'Build & Data',
  },
  {
    id: 't3',
    text: 'Achieve at least 80% task completion in a small usability study with at least five representative participants.',
    focus: 'discovery',
    focusLabel: 'Discovery & UX',
  },
  {
    id: 't4',
    text: 'Evaluate forecasts against a seasonal-naive baseline using a time-based holdout.',
    focus: 'build',
    focusLabel: 'Build & Data',
  },
  {
    id: 't5',
    text: 'Complete a security and data-quality checklist before pilot testing.',
    focus: 'security',
    focusLabel: 'Security & Quality',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'abdullah',
    name: 'Abdullah Irshad',
    studentId: 'CT-24271',
    designation: 'Project and Product Lead',
    track: 'product-ux',
    skills: 'Customer discovery, requirements writing, milestone planning and coordination.',
    responsibilities: 'Plan discovery, clarify product needs, track milestones and coordinate the project team.',
    deliverables: 'Workflow interview findings, a requirements outline and a maintained project plan.',
    objectives: 'Strengthen product leadership and stakeholder communication through structured discovery and planning.',
  },
  {
    id: 'hammad',
    name: 'Hafiz Hammad Shahid',
    studentId: 'CT-24274',
    designation: 'Data and ML Lead',
    track: 'data-platform',
    skills: 'Data quality, analytics, forecasting baselines and time-based evaluation.',
    responsibilities: 'Plan data checks and compare forecasting approaches against a suitable baseline.',
    deliverables: 'A data-quality checklist, an analytics prototype and documented baseline evaluations.',
    objectives: 'Develop rigorous, explainable data analysis and forecasting evaluation practices.',
  },
  {
    id: 'umer',
    name: 'Umer Pervez',
    studentId: 'CT-24254',
    designation: 'Platform and Security Lead',
    track: 'data-platform',
    skills: 'Future architecture, access controls, deployment preparation and security planning.',
    responsibilities: 'Shape the proposed platform design and plan access, security and static deployment checks.',
    deliverables: 'A platform architecture outline, an access-control plan and a security checklist.',
    objectives: 'Build practical experience designing secure, maintainable platforms and deployment workflows.',
  },
  {
    id: 'gohar',
    name: 'Gohar Zehra',
    studentId: 'CT-24063',
    designation: 'Application and UX Lead',
    track: 'product-ux',
    skills: 'Responsive interfaces, accessibility, user experience and frontend mockups.',
    responsibilities: 'Plan and build the website and responsive interface concepts, with accessibility in mind.',
    deliverables: 'A responsive company website, accessible concept mockups and interface review notes.',
    objectives: 'Grow user-centered interface design and frontend implementation skills, especially in accessibility.',
  },
];

export const SERVICE_CAPABILITIES: ServiceCapability[] = [
  {
    code: 'A',
    title: 'Inventory management',
    description:
      'Product records, stock movements, minimum-stock thresholds and a low-stock review queue.',
    featured: true,
    connectedWorkflowSteps: ['Record', 'Check', 'Review'],
    proposedLead: 'Abdullah Irshad & Gohar Zehra',
  },
  {
    code: 'B',
    title: 'Sales and purchasing',
    description: 'Transaction entry and validated CSV imports.',
    connectedWorkflowSteps: ['Record', 'Check'],
    proposedLead: 'Abdullah Irshad & Umer Pervez',
  },
  {
    code: 'C',
    title: 'Business reporting',
    description: 'Sales, purchase and inventory summaries with data-quality warnings.',
    connectedWorkflowSteps: ['Review'],
    proposedLead: 'Hafiz Hammad Shahid & Gohar Zehra',
  },
  {
    code: 'D',
    title: 'Demand forecasting',
    description: 'Baseline comparisons, uncertainty ranges and reorder suggestions for human review.',
    connectedWorkflowSteps: ['Consider', 'Decide'],
    proposedLead: 'Hafiz Hammad Shahid',
  },
  {
    code: 'E',
    title: 'Controlled access and exports',
    description: 'Planned user roles, organization separation, audit events and record exports.',
    connectedWorkflowSteps: ['Check', 'Decide'],
    proposedLead: 'Umer Pervez',
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'record',
    number: '01',
    title: 'Record',
    description:
      'Staff would record or import product details and transactions. This concept page does not accept uploads.',
    relatedCapability: 'Sales and purchasing · Inventory management',
  },
  {
    id: 'check',
    number: '02',
    title: 'Check',
    description:
      'A future system would validate entries and update stock. Validation and stock updates are not implemented here.',
    relatedCapability: 'Controlled access and exports · Inventory management',
  },
  {
    id: 'review',
    number: '03',
    title: 'Review',
    description:
      'Owners could review sales, purchasing and stock summaries, including records that may need attention.',
    relatedCapability: 'Business reporting · Inventory management',
  },
  {
    id: 'consider',
    number: '04',
    title: 'Consider',
    description:
      'Eligible items could receive forecast suggestions after comparison with a baseline. No forecast is calculated in this mockup.',
    relatedCapability: 'Demand forecasting',
  },
  {
    id: 'decide',
    number: '05',
    title: 'Decide',
    description:
      'A person would check the supporting records and choose what to do. The proposal does not include autonomous purchasing.',
    relatedCapability: 'Human review · Controlled access and exports',
  },
];

export const FORECAST_REVIEW_CHECKS: ForecastCheckItem[] = [
  {
    id: 'history',
    label: 'Transaction history verified',
    detail: 'Confirm routine sales and stock movements are free of missing dates or duplicate CSV imports.',
  },
  {
    id: 'baseline',
    label: 'Seasonal-naive baseline compared',
    detail: 'Check whether a proposed forecast adds clarity over a straightforward seasonal-naive baseline.',
  },
  {
    id: 'human-signoff',
    label: 'Human review before reorder',
    detail: 'Owner or manager reviews uncertainty ranges and source records before placing any order.',
  },
];

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'm1-2',
    period: 'Months 1–2',
    title: 'Validate and design',
    focusSummary: 'Conduct workflow interviews, confirm requirements outline and design accessible interface concepts.',
    linkedRoles: ['Project and Product Lead', 'Application and UX Lead'],
  },
  {
    id: 'm3-4',
    period: 'Months 3–4',
    title: 'Build core workflows',
    focusSummary: 'Implement product records, stock movements, transaction entry and role-based access structure.',
    linkedRoles: ['Platform and Security Lead', 'Application and UX Lead'],
  },
  {
    id: 'm5',
    period: 'Month 5',
    title: 'Explore analytics',
    focusSummary: 'Run data-quality checks and evaluate forecasting prototypes against a seasonal-naive baseline.',
    linkedRoles: ['Data and ML Lead'],
  },
  {
    id: 'm6',
    period: 'Month 6',
    title: 'Integrate the prototype',
    focusSummary: 'Connect four core workflows into an end-to-end prototype with security and data-quality checks.',
    linkedRoles: ['Project and Product Lead', 'Platform and Security Lead'],
  },
  {
    id: 'm7',
    period: 'Month 7',
    title: 'Evaluate with users',
    focusSummary: 'Run usability studies with representative participants targeting at least 80% task completion.',
    linkedRoles: ['Application and UX Lead', 'Project and Product Lead'],
  },
  {
    id: 'm8',
    period: 'Month 8',
    title: 'Finalize the project',
    focusSummary: 'Complete security checklists, document evaluation outcomes and finalize FYP deliverables.',
    linkedRoles: ['All four proposed leads'],
  },
];
