import React, { useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, RuleSet, ChecklistItem, ReportData } from '../types';
import { allRuleSets } from '../data/ruleSets';
import { localStorageUtils } from '../utils/localStorage';
import { AppContext, type AppContextType } from './AppContextDefinition';

// Initial state for the application
const initialReportData: ReportData = {
  issueNumber: '',
  screenshots: [],
  description: '',
  priority: 'medium',
  category: '',
  relatedIssues: []
};

const initialState: AppState = {
  selectedRuleSet: null,
  checklist: [],
  reportData: initialReportData,
  availableRuleSets: allRuleSets,
  generatedMarkdown: ''
};

// Reducer function to handle state updates
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_RULE_SET': {
      // When a rule set is selected, generate checklist from rules
      const checklist: ChecklistItem[] = action.payload.rules.map(rule => ({
        id: rule.id,
        text: rule.text,
        checked: false,
        category: rule.category
      }));
      
      return {
        ...state,
        selectedRuleSet: action.payload,
        checklist,
        generatedMarkdown: '' // Reset markdown when rule set changes
      };
    }

    case 'RESET_RULE_SET':
      return {
        ...state,
        selectedRuleSet: null,
        checklist: [],
        generatedMarkdown: ''
      };

    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklist: action.payload,
        generatedMarkdown: '' // Reset markdown when checklist changes
      };

    case 'UPDATE_REPORT_DATA':
      return {
        ...state,
        reportData: action.payload,
        generatedMarkdown: '' // Reset markdown when report data changes
      };

    case 'GENERATE_MARKDOWN':
      return {
        ...state,
        generatedMarkdown: action.payload
      };

    case 'SET_AVAILABLE_RULE_SETS':
      return {
        ...state,
        availableRuleSets: action.payload
      };

    default:
      return state;
  }
};



// Provider component props
interface AppProviderProps {
  children: ReactNode;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeFromStorage = () => {
      try {
        // Load stored rule sets and merge with defaults
        const storedRuleSets = localStorageUtils.getRuleSets();
        const mergedRuleSets = [...allRuleSets];
        
        // Add stored rule sets that don't exist in defaults
        storedRuleSets.forEach(storedRuleSet => {
          const existsInDefaults = mergedRuleSets.some(rs => rs.id === storedRuleSet.id);
          if (!existsInDefaults) {
            mergedRuleSets.push(storedRuleSet);
          }
        });

        if (mergedRuleSets.length !== allRuleSets.length) {
          dispatch({ type: 'SET_AVAILABLE_RULE_SETS', payload: mergedRuleSets });
        }

        // Load saved form data
        const savedFormData = localStorageUtils.getFormData();
        if (savedFormData) {
          dispatch({ type: 'UPDATE_REPORT_DATA', payload: savedFormData as ReportData });
        }

        // Load saved checklist state
        const savedChecklist = localStorageUtils.getChecklistState();
        if (savedChecklist) {
          dispatch({ type: 'UPDATE_CHECKLIST', payload: savedChecklist });
        }
      } catch (error) {
        console.error('Failed to initialize from localStorage:', error);
      }
    };

    initializeFromStorage();
  }, []);

  // Helper function to set rule set
  const setRuleSet = (ruleSet: RuleSet | null) => {
    if (ruleSet) {
      dispatch({ type: 'SET_RULE_SET', payload: ruleSet });
    } else {
      dispatch({ type: 'RESET_RULE_SET' });
    }
  };

  // Helper function to update individual checklist item
  const updateChecklistItem = (itemId: string, checked: boolean) => {
    const updatedChecklist = state.checklist.map(item =>
      item.id === itemId ? { ...item, checked } : item
    );
    dispatch({ type: 'UPDATE_CHECKLIST', payload: updatedChecklist });
    
    // Auto-save to localStorage
    try {
      localStorageUtils.saveChecklistState(updatedChecklist);
    } catch (error) {
      console.error('Failed to save checklist state:', error);
    }
  };

  // Helper function to update report data
  const updateReportData = (data: Partial<ReportData>) => {
    const updatedReportData = { ...state.reportData, ...data };
    dispatch({ type: 'UPDATE_REPORT_DATA', payload: updatedReportData });
    
    // Auto-save to localStorage
    try {
      localStorageUtils.saveFormData(updatedReportData);
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  // Helper function to generate markdown
  const generateMarkdown = (markdown: string) => {
    dispatch({ type: 'GENERATE_MARKDOWN', payload: markdown });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setRuleSet,
    updateChecklistItem,
    updateReportData,
    generateMarkdown
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Note: useAppContext hook is exported from useAppContext.ts