// Core type definitions for the Backlog Assist application

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category?: string;
}

export interface RuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  rules: Rule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Rule {
  id: string;
  text: string;
  category: string;
  priority: number;
  description?: string;
}

export interface ReportData {
  issueNumber: string;
  screenshots: File[];
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  relatedIssues?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'size' | 'type';
}

export interface AppState {
  selectedRuleSet: RuleSet | null;
  checklist: ChecklistItem[];
  reportData: ReportData;
  availableRuleSets: RuleSet[];
  generatedMarkdown: string;
}

export type AppAction = 
  | { type: 'SET_RULE_SET'; payload: RuleSet }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem[] }
  | { type: 'UPDATE_REPORT_DATA'; payload: ReportData }
  | { type: 'GENERATE_MARKDOWN' };