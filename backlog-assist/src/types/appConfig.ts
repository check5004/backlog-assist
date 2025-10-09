// Application configuration types and interfaces

import type { BacklogApiConfig } from './backlogApi';

export interface AppConfig {
  // General application settings
  general: {
    language: 'ja' | 'en';
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
    showNotifications: boolean;
  };
  
  // Backlog API integration settings
  backlogApi?: {
    enabled: boolean;
    config?: BacklogApiConfig;
    autoFetchIssueDetails: boolean;
    autoUploadScreenshots: boolean;
  };
  
  // Default values for forms
  defaults: {
    ruleSetId?: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    markdownTemplate?: string;
  };
  
  // UI preferences
  ui: {
    compactMode: boolean;
    showProgressIndicator: boolean;
    showStatusPanel: boolean;
    defaultView: 'split' | 'tabs';
  };
  
  // Advanced settings
  advanced: {
    enableDebugMode: boolean;
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
    localStorageQuotaWarning: number; // in MB
  };
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ConfigValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ConfigExportData {
  version: string;
  exportedAt: string;
  config: AppConfig;
  metadata: {
    appVersion: string;
    userAgent: string;
  };
}

export interface ConfigImportResult {
  success: boolean;
  config?: AppConfig;
  errors?: string[];
  warnings?: string[];
}

// Configuration manager interface
export interface ConfigManager {
  // Configuration CRUD operations
  getConfig(): AppConfig;
  updateConfig(config: Partial<AppConfig>): void;
  resetConfig(): void;
  
  // Validation
  validateConfig(config: AppConfig): ConfigValidationResult;
  
  // Import/Export
  exportConfig(): ConfigExportData;
  importConfig(data: string): ConfigImportResult;
  
  // Event handling
  onConfigChange(callback: (config: AppConfig) => void): () => void;
  
  // Utility methods
  getDefaultConfig(): AppConfig;
  migrateConfig(oldConfig: any, version: string): AppConfig;
}

// Default configuration values
export const DEFAULT_APP_CONFIG: AppConfig = {
  general: {
    language: 'ja',
    theme: 'light',
    autoSave: true,
    showNotifications: true
  },
  
  backlogApi: {
    enabled: false,
    autoFetchIssueDetails: false,
    autoUploadScreenshots: false
  },
  
  defaults: {
    priority: 'medium',
    category: 'その他'
  },
  
  ui: {
    compactMode: false,
    showProgressIndicator: true,
    showStatusPanel: true,
    defaultView: 'split'
  },
  
  advanced: {
    enableDebugMode: false,
    maxFileSize: 10, // 10MB
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    localStorageQuotaWarning: 5 // 5MB
  }
};

// Configuration field metadata for UI generation
export interface ConfigFieldMetadata {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'multiselect';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required?: boolean;
  category: string;
  advanced?: boolean;
}

export const CONFIG_FIELD_METADATA: ConfigFieldMetadata[] = [
  // General settings
  {
    key: 'general.language',
    label: '言語',
    description: 'アプリケーションの表示言語',
    type: 'select',
    options: [
      { value: 'ja', label: '日本語' },
      { value: 'en', label: 'English' }
    ],
    category: '一般設定'
  },
  {
    key: 'general.theme',
    label: 'テーマ',
    description: 'アプリケーションの外観テーマ',
    type: 'select',
    options: [
      { value: 'light', label: 'ライト' },
      { value: 'dark', label: 'ダーク' },
      { value: 'auto', label: 'システム設定に従う' }
    ],
    category: '一般設定'
  },
  {
    key: 'general.autoSave',
    label: '自動保存',
    description: 'フォームデータを自動的に保存する',
    type: 'boolean',
    category: '一般設定'
  },
  {
    key: 'general.showNotifications',
    label: '通知表示',
    description: '操作完了時の通知を表示する',
    type: 'boolean',
    category: '一般設定'
  },
  
  // Default values
  {
    key: 'defaults.priority',
    label: 'デフォルト優先度',
    description: '新しい報告のデフォルト優先度',
    type: 'select',
    options: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ],
    category: 'デフォルト値'
  },
  {
    key: 'defaults.category',
    label: 'デフォルトカテゴリ',
    description: '新しい報告のデフォルトカテゴリ',
    type: 'string',
    category: 'デフォルト値'
  },
  
  // UI preferences
  {
    key: 'ui.compactMode',
    label: 'コンパクトモード',
    description: 'UIをコンパクトに表示する',
    type: 'boolean',
    category: 'UI設定'
  },
  {
    key: 'ui.showProgressIndicator',
    label: '進捗インジケーター',
    description: 'チェックリストの進捗を表示する',
    type: 'boolean',
    category: 'UI設定'
  },
  {
    key: 'ui.showStatusPanel',
    label: 'ステータスパネル',
    description: '現在の状態パネルを表示する',
    type: 'boolean',
    category: 'UI設定'
  },
  {
    key: 'ui.defaultView',
    label: 'デフォルト表示',
    description: 'アプリケーションのデフォルト表示モード',
    type: 'select',
    options: [
      { value: 'split', label: '分割表示' },
      { value: 'tabs', label: 'タブ表示' }
    ],
    category: 'UI設定'
  },
  
  // Advanced settings
  {
    key: 'advanced.enableDebugMode',
    label: 'デバッグモード',
    description: 'デバッグ情報をコンソールに出力する',
    type: 'boolean',
    category: '高度な設定',
    advanced: true
  },
  {
    key: 'advanced.maxFileSize',
    label: '最大ファイルサイズ (MB)',
    description: 'アップロード可能な最大ファイルサイズ',
    type: 'number',
    min: 1,
    max: 50,
    category: '高度な設定',
    advanced: true
  },
  {
    key: 'advanced.localStorageQuotaWarning',
    label: 'ストレージ警告閾値 (MB)',
    description: 'LocalStorage使用量の警告を表示する閾値',
    type: 'number',
    min: 1,
    max: 10,
    category: '高度な設定',
    advanced: true
  }
];

// Utility types for configuration paths
export type ConfigPath = 
  | 'general.language'
  | 'general.theme'
  | 'general.autoSave'
  | 'general.showNotifications'
  | 'backlogApi.enabled'
  | 'backlogApi.autoFetchIssueDetails'
  | 'backlogApi.autoUploadScreenshots'
  | 'defaults.ruleSetId'
  | 'defaults.priority'
  | 'defaults.category'
  | 'defaults.markdownTemplate'
  | 'ui.compactMode'
  | 'ui.showProgressIndicator'
  | 'ui.showStatusPanel'
  | 'ui.defaultView'
  | 'advanced.enableDebugMode'
  | 'advanced.maxFileSize'
  | 'advanced.localStorageQuotaWarning';

// Helper type for getting nested property type
export type ConfigValue<T extends ConfigPath> = 
  T extends 'general.language' ? 'ja' | 'en' :
  T extends 'general.theme' ? 'light' | 'dark' | 'auto' :
  T extends 'general.autoSave' ? boolean :
  T extends 'general.showNotifications' ? boolean :
  T extends 'defaults.priority' ? 'low' | 'medium' | 'high' :
  T extends 'defaults.category' ? string :
  T extends 'ui.defaultView' ? 'split' | 'tabs' :
  T extends 'advanced.maxFileSize' ? number :
  T extends 'advanced.localStorageQuotaWarning' ? number :
  boolean | string | number;