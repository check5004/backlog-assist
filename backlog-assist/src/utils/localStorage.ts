import type { RuleSet } from '../types';

export const localStorageUtils = {
  saveRuleSet: (ruleSet: RuleSet): void => {
    try {
      const existingRuleSets = localStorageUtils.getRuleSets();
      const updatedRuleSets = existingRuleSets.filter(rs => rs.id !== ruleSet.id);
      updatedRuleSets.push(ruleSet);
      localStorage.setItem('backlog-assist-rulesets', JSON.stringify(updatedRuleSets));
    } catch (error) {
      console.error('Failed to save rule set to localStorage:', error);
    }
  },

  getRuleSets: (): RuleSet[] => {
    try {
      const stored = localStorage.getItem('backlog-assist-rulesets');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load rule sets from localStorage:', error);
      return [];
    }
  },

  removeRuleSet: (ruleSetId: string): void => {
    try {
      const existingRuleSets = localStorageUtils.getRuleSets();
      const updatedRuleSets = existingRuleSets.filter(rs => rs.id !== ruleSetId);
      localStorage.setItem('backlog-assist-rulesets', JSON.stringify(updatedRuleSets));
    } catch (error) {
      console.error('Failed to remove rule set from localStorage:', error);
    }
  }
};