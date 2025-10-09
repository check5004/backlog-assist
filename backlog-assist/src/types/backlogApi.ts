// Backlog API integration types and interfaces

export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang?: string;
  mailAddress?: string;
}

export interface BacklogStatus {
  id: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogPriority {
  id: number;
  name: string;
}

export interface BacklogIssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogCategory {
  id: number;
  name: string;
  displayOrder: number;
}

export interface BacklogProject {
  id: number;
  projectKey: string;
  name: string;
  chartEnabled: boolean;
  subtaskingEnabled: boolean;
  projectLeaderCanEditProjectLeader: boolean;
  useWiki: boolean;
  useFileSharing: boolean;
  useDevAttributes: boolean;
  useResolvedForChart: boolean;
  textFormattingRule: string;
  archived: boolean;
}

export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: BacklogIssueType;
  summary: string;
  description: string;
  resolution?: any;
  priority: BacklogPriority;
  status: BacklogStatus;
  assignee?: BacklogUser;
  category?: BacklogCategory[];
  versions?: any[];
  milestone?: any[];
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  parentIssueId?: number;
  createdUser: BacklogUser;
  created: string;
  updatedUser?: BacklogUser;
  updated?: string;
  customFields?: any[];
  attachments?: BacklogAttachment[];
  sharedFiles?: any[];
  stars?: any[];
}

export interface BacklogAttachment {
  id: number;
  name: string;
  size: number;
  createdUser: BacklogUser;
  created: string;
}

export interface BacklogComment {
  id: number;
  content: string;
  changeLog?: any[];
  createdUser: BacklogUser;
  created: string;
  updated?: string;
  stars?: any[];
  notifications?: any[];
}

export interface BacklogApiConfig {
  baseUrl: string;
  apiKey: string;
  projectKey?: string;
}

export interface BacklogApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface BacklogApiResponse<T> {
  success: boolean;
  data?: T;
  error?: BacklogApiError;
}

// API Client interface for future implementation
export interface BacklogApiClient {
  // Configuration
  configure(config: BacklogApiConfig): void;
  isConfigured(): boolean;
  
  // Authentication
  authenticate(): Promise<BacklogApiResponse<BacklogUser>>;
  
  // Project operations
  getProject(projectKey: string): Promise<BacklogApiResponse<BacklogProject>>;
  
  // Issue operations
  getIssue(issueKey: string): Promise<BacklogApiResponse<BacklogIssue>>;
  getIssues(projectKey: string, options?: IssueQueryOptions): Promise<BacklogApiResponse<BacklogIssue[]>>;
  
  // Comment operations
  addComment(issueKey: string, content: string): Promise<BacklogApiResponse<BacklogComment>>;
  getComments(issueKey: string): Promise<BacklogApiResponse<BacklogComment[]>>;
  
  // File operations
  uploadAttachment(issueKey: string, file: File): Promise<BacklogApiResponse<BacklogAttachment>>;
}

export interface IssueQueryOptions {
  statusId?: number[];
  assigneeId?: number[];
  createdUserId?: number[];
  resolutionId?: number[];
  parentChild?: number;
  attachment?: boolean;
  sharedFile?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  offset?: number;
  count?: number;
  createdSince?: string;
  createdUntil?: string;
  updatedSince?: string;
  updatedUntil?: string;
  startDateSince?: string;
  startDateUntil?: string;
  dueDateSince?: string;
  dueDateUntil?: string;
  id?: number[];
  parentIssueId?: number[];
  keyword?: string;
}

// Helper types for API integration
export interface BacklogIntegrationState {
  isEnabled: boolean;
  isAuthenticated: boolean;
  currentUser?: BacklogUser;
  currentProject?: BacklogProject;
  lastError?: BacklogApiError;
}

export interface BacklogIntegrationActions {
  enable: () => void;
  disable: () => void;
  authenticate: (config: BacklogApiConfig) => Promise<void>;
  logout: () => void;
  fetchIssue: (issueKey: string) => Promise<BacklogIssue | null>;
  addComment: (issueKey: string, content: string) => Promise<boolean>;
}