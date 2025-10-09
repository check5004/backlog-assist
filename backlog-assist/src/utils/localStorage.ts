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
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      // Note: screenshots are stored as string array (file names) 
      // but ReportData expects File array, so we reset it to empty
      if (data.screenshots && Array.isArray(data.screenshots)) {
        data.screenshots = [];
      }
      
      return data;
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
  validateStoredData: (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      // Validate rule sets
      const ruleSets = localStorageUtils.getRuleSets();
      if (ruleSets) {
        if (!Array.isArray(ruleSets)) {
          errors.push('Rule sets data is not an array');
        } else {
          ruleSets.forEach((ruleSet, index) => {
            if (!ruleSet.id || typeof ruleSet.id !== 'string') {
              errors.push(`Rule set at index ${index} has invalid id`);
            }
            if (!ruleSet.name || typeof ruleSet.name !== 'string') {
              errors.push(`Rule set at index ${index} has invalid name`);
            }
            if (!Array.isArray(ruleSet.rules)) {
              errors.push(`Rule set at index ${index} has invalid rules array`);
            }
            if (!(ruleSet.createdAt instanceof Date) && !ruleSet.createdAt) {
              errors.push(`Rule set at index ${index} has invalid createdAt date`);
            }
          });
        }
      }

      // Validate form data
      const formData = localStorageUtils.getFormData();
      if (formData) {
        if (typeof formData !== 'object' || formData === null) {
          errors.push('Form data is not a valid object');
        } else {
          if (formData.priority && !['low', 'medium', 'high'].includes(formData.priority)) {
            errors.push('Form data has invalid priority value');
          }
          if (formData.screenshots && !Array.isArray(formData.screenshots)) {
            errors.push('Form data screenshots is not an array');
          }
        }
      }

      // Validate checklist state
      const checklistState = localStorageUtils.getChecklistState();
      if (checklistState) {
        if (!Array.isArray(checklistState)) {
          errors.push('Checklist state is not an array');
        } else {
          checklistState.forEach((item, index) => {
            if (!item.id || typeof item.id !== 'string') {
              errors.push(`Checklist item at index ${index} has invalid id`);
            }
            if (!item.text || typeof item.text !== 'string') {
              errors.push(`Checklist item at index ${index} has invalid text`);
            }
            if (typeof item.checked !== 'boolean') {
              errors.push(`Checklist item at index ${index} has invalid checked value`);
            }
          });
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      console.error('Data integrity check failed:', error);
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
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
  },

  // Get storage usage information
  getStorageInfo: (): { used: number; available: number; keys: string[] } => {
    try {
      const keys = Object.values(STORAGE_KEYS).filter(key => 
        localStorage.getItem(key) !== null
      );
      
      let used = 0;
      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      });

      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimated - used);

      return { used, available, keys };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, keys: [] };
    }
  },

  // Backup all data to a JSON object
  exportData: (): string => {
    try {
      const data = {
        ruleSets: localStorageUtils.getRuleSets(),
        formData: localStorageUtils.getFormData(),
        checklistState: localStorageUtils.getChecklistState(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  },

  // Import data from a JSON string
  importData: (jsonData: string): { success: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const data = JSON.parse(jsonData);
      
      // Validate import data structure
      if (!data.version) {
        errors.push('インポートデータにバージョン情報がありません');
      }
      
      if (data.ruleSets && Array.isArray(data.ruleSets)) {
        data.ruleSets.forEach((ruleSet: any) => {
          try {
            localStorageUtils.saveRuleSet({
              ...ruleSet,
              createdAt: new Date(ruleSet.createdAt),
              updatedAt: new Date(ruleSet.updatedAt)
            });
          } catch (error) {
            errors.push(`ルールセット "${ruleSet.name}" のインポートに失敗しました`);
          }
        });
      }
      
      if (data.formData) {
        try {
          localStorageUtils.saveFormData(data.formData);
        } catch (error) {
          errors.push('フォームデータのインポートに失敗しました');
        }
      }
      
      if (data.checklistState && Array.isArray(data.checklistState)) {
        try {
          localStorageUtils.saveChecklistState(data.checklistState);
        } catch (error) {
          errors.push('チェックリスト状態のインポートに失敗しました');
        }
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      console.error('Failed to import data:', error);
      errors.push('データの解析に失敗しました。有効なJSONファイルを選択してください。');
      return { success: false, errors };
    }
  },

  // Repair corrupted data by removing invalid entries
  repairData: (): { repaired: boolean; actions: string[] } => {
    const actions: string[] = [];
    let repaired = false;

    try {
      const validation = localStorageUtils.validateStoredData();
      
      if (!validation.isValid) {
        // Try to repair rule sets
        try {
          const ruleSets = localStorageUtils.getRuleSets();
          const validRuleSets = ruleSets.filter(ruleSet => {
            return ruleSet.id && ruleSet.name && Array.isArray(ruleSet.rules);
          });
          
          if (validRuleSets.length !== ruleSets.length) {
            localStorage.setItem(STORAGE_KEYS.RULE_SETS, JSON.stringify(validRuleSets));
            actions.push(`${ruleSets.length - validRuleSets.length}個の無効なルールセットを削除しました`);
            repaired = true;
          }
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.RULE_SETS);
          actions.push('破損したルールセットデータを削除しました');
          repaired = true;
        }

        // Try to repair form data
        try {
          const formData = localStorageUtils.getFormData();
          if (formData && typeof formData !== 'object') {
            localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
            actions.push('破損したフォームデータを削除しました');
            repaired = true;
          }
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
          actions.push('破損したフォームデータを削除しました');
          repaired = true;
        }

        // Try to repair checklist state
        try {
          const checklistState = localStorageUtils.getChecklistState();
          if (checklistState && !Array.isArray(checklistState)) {
            localStorage.removeItem(STORAGE_KEYS.CHECKLIST_STATE);
            actions.push('破損したチェックリスト状態を削除しました');
            repaired = true;
          }
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.CHECKLIST_STATE);
          actions.push('破損したチェックリスト状態を削除しました');
          repaired = true;
        }
      }

      return { repaired, actions };
    } catch (error) {
      console.error('Failed to repair data:', error);
      actions.push('データの修復中にエラーが発生しました');
      return { repaired: false, actions };
    }
  }
};