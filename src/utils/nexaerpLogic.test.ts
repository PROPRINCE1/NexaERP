import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_SAMPLE_ITEMS,
  PROJECT_TARGETS,
  TEAM_MEMBERS,
} from '../data/nexaerpData';
import {
  evaluateInventoryItems,
  filterEvaluatedInventory,
  filterProjectTargets,
  filterTeamMembers,
  getKeyboardNavIndex,
  getNextStepIndex,
  getPreviousStepIndex,
  getWorkflowStepIndexForCapability,
  summarizeInventory,
} from './nexaerpLogic';

test('evaluateInventoryItems flags items strictly below active threshold', () => {
  const evaluated = evaluateInventoryItems(HERO_SAMPLE_ITEMS);
  assert.equal(evaluated.length, 3);
  assert.equal(evaluated[0].statusLabel, 'In range'); // 48 >= 20
  assert.equal(evaluated[1].statusLabel, 'Review stock'); // 8 < 12
  assert.equal(evaluated[1].workbenchStatusLabel, 'Check threshold');
  assert.equal(evaluated[2].statusLabel, 'In range'); // 24 >= 15

  const summary = summarizeInventory(evaluated);
  assert.deepEqual(summary, {
    totalItems: 3,
    reviewCount: 1,
    inRangeCount: 2,
  });
});

test('threshold overrides recalculate review status and summary counts reactively', () => {
  const evaluated = evaluateInventoryItems(HERO_SAMPLE_ITEMS, {
    oil: 5, // 8 >= 5 -> now In range
    tea: 30, // 24 < 30 -> now Review stock
  });

  assert.equal(evaluated[1].needsReview, false);
  assert.equal(evaluated[2].needsReview, true);
  assert.equal(summarizeInventory(evaluated).reviewCount, 1);

  const reviewOnly = filterEvaluatedInventory(evaluated, 'review');
  assert.equal(reviewOnly.length, 1);
  assert.equal(reviewOnly[0].id, 'tea');
});

test('workflow step navigation respects boundaries and keyboard wrapping', () => {
  assert.equal(getPreviousStepIndex(0), 0);
  assert.equal(getPreviousStepIndex(3), 2);
  assert.equal(getNextStepIndex(4, 5), 4);
  assert.equal(getNextStepIndex(2, 5), 3);

  assert.equal(getKeyboardNavIndex('ArrowRight', 4, 5, true), 0);
  assert.equal(getKeyboardNavIndex('ArrowLeft', 0, 5, true), 4);
  assert.equal(getKeyboardNavIndex('ArrowDown', 1, 5, true), 2);
  assert.equal(getKeyboardNavIndex('ArrowUp', 0, 5, true), 4);
  assert.equal(getKeyboardNavIndex('Home', 3, 5, true), 0);
  assert.equal(getKeyboardNavIndex('End', 1, 5, true), 4);
  assert.equal(getKeyboardNavIndex('Enter', 1, 5, true), null);
});

test('target and team filters return matching subsets cleanly', () => {
  assert.equal(filterProjectTargets(PROJECT_TARGETS, 'all').length, 5);
  assert.equal(filterProjectTargets(PROJECT_TARGETS, 'discovery').length, 2);
  assert.equal(filterProjectTargets(PROJECT_TARGETS, 'build').length, 2);
  assert.equal(filterProjectTargets(PROJECT_TARGETS, 'security').length, 1);

  assert.equal(filterTeamMembers(TEAM_MEMBERS, 'all').length, 4);
  assert.equal(filterTeamMembers(TEAM_MEMBERS, 'product-ux').length, 2);
  assert.equal(filterTeamMembers(TEAM_MEMBERS, 'data-platform').length, 2);
});

test('capability codes map to expected workflow step indices', () => {
  assert.equal(getWorkflowStepIndexForCapability('A'), 0);
  assert.equal(getWorkflowStepIndexForCapability('C'), 2);
  assert.equal(getWorkflowStepIndexForCapability('D'), 3);
  assert.equal(getWorkflowStepIndexForCapability('E'), 1);
});
