// Core type definitions for Backlog Assist

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category?: string;
}

export interface Rule {
  id: string;
  text: string;
  category: string;
  priority: number;
  description?: string;
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

export interface ReportData {
  issueNumber: string;
  screenshots: File[];
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  relatedIssues?: string[]; // 関連課題のキー（例: ["PROJ-120", "PROJ-121"]）
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
  | { type: 'GENERATE_MARKDOWN'; payload: string }
  | { type: 'SET_AVAILABLE_RULE_SETS'; payload: RuleSet[] };

// Helper types for component props
export interface ChecklistGeneratorProps {
  selectedRuleSet: RuleSet | null;
  onRuleSetChange: (ruleSet: RuleSet) => void;
  onChecklistUpdate: (checklist: ChecklistItem[]) => void;
}

export interface ReportFormProps {
  reportData: ReportData;
  onReportDataChange: (data: ReportData) => void;
  onValidationError: (errors: ValidationError[]) => void;
}

export interface MarkdownOutputProps {
  checklist: ChecklistItem[];
  reportData: ReportData;
  onCopyToClipboard: () => void;
}