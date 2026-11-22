import type {
  ProjectTarget,
  SampleInventoryItem,
  TeamMember,
} from '../data/nexaerpData';

export type InventoryFilter = 'all' | 'review' | 'in-range';
export type TargetFilter = 'all' | ProjectTarget['focus'];
export type TeamFilter = 'all' | TeamMember['track'];

export interface EvaluatedInventoryItem extends SampleInventoryItem {
  activeThreshold: number;
  needsReview: boolean;
  statusLabel: 'In range' | 'Review stock';
  workbenchStatusLabel: 'In range' | 'Check threshold';
}

export interface InventorySummary {
  totalItems: number;
  reviewCount: number;
  inRangeCount: number;
}

export function evaluateInventoryItems(
  items: SampleInventoryItem[],
  thresholdOverrides: Record<string, number> = {},
): EvaluatedInventoryItem[] {
  return items.map((item) => {
    const rawThreshold = thresholdOverrides[item.id] ?? item.defaultThreshold;
    const activeThreshold = Number.isFinite(rawThreshold) ? Math.max(0, rawThreshold) : item.defaultThreshold;
    const needsReview = item.onHand < activeThreshold;
    return {
      ...item,
      activeThreshold,
      needsReview,
      statusLabel: needsReview ? 'Review stock' : 'In range',
      workbenchStatusLabel: needsReview ? 'Check threshold' : 'In range',
    };
  });
}

export function filterEvaluatedInventory(
  items: EvaluatedInventoryItem[],
  filter: InventoryFilter,
): EvaluatedInventoryItem[] {
  if (filter === 'review') {
    return items.filter((item) => item.needsReview);
  }
  if (filter === 'in-range') {
    return items.filter((item) => !item.needsReview);
  }
  return items;
}

export function summarizeInventory(items: EvaluatedInventoryItem[]): InventorySummary {
  const reviewCount = items.filter((item) => item.needsReview).length;
  return {
    totalItems: items.length,
    reviewCount,
    inRangeCount: items.length - reviewCount,
  };
}

export function getNextStepIndex(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(totalSteps - 1, currentIndex + 1);
}

export function getPreviousStepIndex(currentIndex: number): number {
  return Math.max(0, currentIndex - 1);
}

export function getKeyboardNavIndex(
  key: string,
  currentIndex: number,
  totalCount: number,
  allowVertical = false,
): number | null {
  if (totalCount <= 0) return null;

  if (key === 'ArrowRight' || (allowVertical && key === 'ArrowDown')) {
    return (currentIndex + 1) % totalCount;
  }
  if (key === 'ArrowLeft' || (allowVertical && key === 'ArrowUp')) {
    return (currentIndex - 1 + totalCount) % totalCount;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return totalCount - 1;
  }
  return null;
}

export function filterProjectTargets(
  targets: ProjectTarget[],
  filter: TargetFilter,
): ProjectTarget[] {
  if (filter === 'all') return targets;
  return targets.filter((target) => target.focus === filter);
}

export function filterTeamMembers(
  members: TeamMember[],
  filter: TeamFilter,
): TeamMember[] {
  if (filter === 'all') return members;
  return members.filter((member) => member.track === filter);
}

const CAPABILITY_TO_WORKFLOW_INDEX: Record<'A' | 'B' | 'C' | 'D' | 'E', number> = {
  A: 0, // Record
  B: 0, // Record
  C: 2, // Review
  D: 3, // Consider
  E: 1, // Check
};

export function getWorkflowStepIndexForCapability(
  code: 'A' | 'B' | 'C' | 'D' | 'E',
): number {
  return CAPABILITY_TO_WORKFLOW_INDEX[code] ?? 0;
}

