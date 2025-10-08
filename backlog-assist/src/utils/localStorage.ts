import type { RuleSet, ReportData, ChecklistItem } from '../types';

const STORAGE_KEYS = {
  RULE_SETS: 'backlog-assist-rulesets',
  FORM_DATA: 'backlog-assist-form-data',
  CHECKLIST_STATE: 'backlog-assist-checklist-state'
} as const;

export const localStorageUtils = {
  // Rule Set management
  saveRuleSet: (ruleSet: RuleSet): void => {
    try {
      const existingRuleSets = localStorageUtils.getRuleSets();
      const updatedRuleSets = existingRuleSets.filter(rs => rs.id !== ruleSet.id);
      updatedRuleSets.push({
        ...ruleSet,
        updatedAt: new Date()
      });
      localStorage.setItem(STORAGE_KEYS.RULE_SETS, JSON.stringify(updatedRuleSets));
    } catch (error) {
      console.error('Failed to save rule set to localStorage:', error);
    }
  },

  getRuleSets: (): RuleSet[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RULE_SETS);
      if (!stored) return [];
      
      const ruleSets = JSON.parse(stored);
      // Convert date strings back to Date objects
      return ruleSets.map((ruleSet: any) => ({
        ...ruleSet,
        createdAt: new Date(ruleSet.createdAt),
        updatedAt: new Date(ruleSet.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load rule sets from localStorage:', error);
      return [];
    }
  },

  removeRuleSet: (ruleSetId: string): void => {
    try {
      const existingRuleSets = localStorageUtils.getRuleSets();
      const updatedRuleSets = existingRuleSets.filter(rs => rs.id !== ruleSetId);
      localStorage.setItem(STORAGE_KEYS.RULE_SETS, JSON.stringify(updatedRuleSets));
    } catch (error) {
      console.error('Failed to remove rule set from localStorage:', error);
    }
  },

  // Form data persistence (temporary save)
  saveFormData: (reportData: Partial<ReportData>): void => {
    try {
      // Don't save File objects to localStorage, only save file names
      const dataToSave = {
        ...reportData,
        screenshots: reportData.screenshots?.map(file => file.name) || []
      };
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error);
    }
  },

  getFormData: (): Partial<ReportData> | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load form data from localStorage:', error);
      return null;
    }
  },

  clearFormData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    } catch (error) {
      console.error('Failed to clear form data from localStorage:', error);
    }
  },

  // Checklist state persistence
  saveChecklistState: (checklist: ChecklistItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST_STATE, JSON.stringify(checklist));
    } catch (error) {
      console.error('Failed to save checklist state to localStorage:', error);
    }
  },

  getChecklistState: (): ChecklistItem[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHECKLIST_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load checklist state from localStorage:', error);
      return null;
    }
  },

  clearChecklistState: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHECKLIST_STATE);
    } catch (error) {
      console.error('Failed to clear checklist state from localStorage:', error);
    }
  },

  // Data integrity check
  validateStoredData: (): boolean => {
    try {
      const ruleSets = localStorageUtils.getRuleSets();
      const formData = localStorageUtils.getFormData();
      const checklistState = localStorageUtils.getChecklistState();

      // Basic validation - check if data can be parsed and has expected structure
      if (ruleSets && !Array.isArray(ruleSets)) return false;
      if (formData && typeof formData !== 'object') return false;
      if (checklistState && !Array.isArray(checklistState)) return false;

      return true;
    } catch (error) {
      console.error('Data integrity check failed:', error);
      return false;
    }
  },

  // Clear all stored data
  clearAllData: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all data from localStorage:', error);
    }
  }
};