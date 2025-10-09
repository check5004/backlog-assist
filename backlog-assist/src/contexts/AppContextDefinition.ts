import { createContext } from 'react';
import type { AppState, AppAction, RuleSet, ReportData } from '../types';

// Context type definition
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions for common operations
  setRuleSet: (ruleSet: RuleSet | null) => void;
  updateChecklistItem: (itemId: string, checked: boolean) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  generateMarkdown: (markdown: string) => void;
  clearTemporaryData: () => void;
}

// Create the context
export const AppContext = createContext<AppContextType | undefined>(undefined);