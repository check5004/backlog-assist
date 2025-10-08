import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  selectedRuleSet: null,
  checklist: [],
  reportData: {
    issueNumber: '',
    screenshots: [],
    description: '',
    priority: 'medium',
    category: '',
    relatedIssues: []
  },
  availableRuleSets: [],
  generatedMarkdown: ''
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_RULE_SET':
      return {
        ...state,
        selectedRuleSet: action.payload,
        checklist: action.payload.rules.map(rule => ({
          id: rule.id,
          text: rule.text,
          checked: false,
          category: rule.category
        }))
      };
    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklist: action.payload
      };
    case 'UPDATE_REPORT_DATA':
      return {
        ...state,
        reportData: action.payload
      };
    case 'GENERATE_MARKDOWN':
      // Placeholder - will be implemented in later tasks
      return {
        ...state,
        generatedMarkdown: 'Generated markdown will appear here'
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};