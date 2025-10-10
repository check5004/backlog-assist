// Configuration Manager Implementation

import type {
  AppConfig,
  ConfigManager,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigExportData,
  ConfigImportResult
} from '../types/appConfig';
import { DEFAULT_APP_CONFIG } from '../types/appConfig';
import type { BacklogApiConfig } from '../types/backlogApi';

const CONFIG_STORAGE_KEY = 'backlog-assist-config';
const CONFIG_VERSION = '1.0.0';

export class ConfigManagerImpl implements ConfigManager {
  private config: AppConfig;
  private listeners: ((config: AppConfig) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    const newConfig = this.mergeConfig(this.config, updates);
    const validation = this.validateConfig(newConfig);
    
    if (!validation.isValid) {
      console.warn('Configuration validation failed:', validation.errors);
      // Still update but log warnings
    }

    this.config = newConfig;
    this.saveConfig();
    this.notifyListeners();
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_APP_CONFIG };
    this.saveConfig();
    this.notifyListeners();
  }

  validateConfig(config: AppConfig): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // Validate general settings
    if (!['ja', 'en'].includes(config.general.language)) {
      errors.push({
        field: 'general.language',
        message: 'Invalid language setting',
        severity: 'error'
      });
    }

    if (!['light', 'dark', 'auto'].includes(config.general.theme)) {
      errors.push({
        field: 'general.theme',
        message: 'Invalid theme setting',
        severity: 'error'
      });
    }

    // Validate defaults
    if (!['low', 'medium', 'high'].includes(config.defaults.priority)) {
      errors.push({
        field: 'defaults.priority',
        message: 'Invalid priority setting',
        severity: 'error'
      });
    }

    if (!config.defaults.category || config.defaults.category.trim().length === 0) {
      warnings.push({
        field: 'defaults.category',
        message: 'Default category is empty',
        suggestion: 'Consider setting a default category'
      });
    }

    // Validate UI settings
    if (!['split', 'tabs'].includes(config.ui.defaultView)) {
      errors.push({
        field: 'ui.defaultView',
        message: 'Invalid default view setting',
        severity: 'error'
      });
    }

    // Validate advanced settings
    if (config.advanced.maxFileSize < 1 || config.advanced.maxFileSize > 50) {
      errors.push({
        field: 'advanced.maxFileSize',
        message: 'Max file size must be between 1 and 50 MB',
        severity: 'error'
      });
    }

    if (config.advanced.localStorageQuotaWarning < 1 || config.advanced.localStorageQuotaWarning > 10) {
      warnings.push({
        field: 'advanced.localStorageQuotaWarning',
        message: 'Storage quota warning threshold should be between 1 and 10 MB',
        suggestion: 'Adjust the threshold to a reasonable value'
      });
    }

    // Validate Backlog API settings if enabled
    if (config.backlogApi?.enabled && config.backlogApi.config) {
      if (!config.backlogApi.config.baseUrl) {
        errors.push({
          field: 'backlogApi.config.baseUrl',
          message: 'Backlog URL is required when API integration is enabled',
          severity: 'error'
        });
      }

      if (!config.backlogApi.config.apiKey) {
        errors.push({
          field: 'backlogApi.config.apiKey',
          message: 'API key is required when API integration is enabled',
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  exportConfig(): ConfigExportData {
    return {
      version: CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      config: this.config,
      metadata: {
        appVersion: CONFIG_VERSION,
        userAgent: navigator.userAgent
      }
    };
  }

  importConfig(data: string): ConfigImportResult {
    try {
      const importData: ConfigExportData = JSON.parse(data);
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate import data structure
      if (!importData.config) {
        return {
          success: false,
          errors: ['Invalid configuration data: missing config object']
        };
      }

      // Version compatibility check
      if (importData.version !== CONFIG_VERSION) {
        warnings.push(`Configuration version mismatch: expected ${CONFIG_VERSION}, got ${importData.version}`);
      }

      // Migrate config if needed
      let config = importData.config;
      if (importData.version !== CONFIG_VERSION) {
        config = this.migrateConfig(config, importData.version);
        warnings.push('Configuration has been migrated to current version');
      }

      // Validate imported config
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(e => `${e.field}: ${e.message}`));
      }

      if (validation.warnings.length > 0) {
        warnings.push(...validation.warnings.map(w => `${w.field}: ${w.message}`));
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings
        };
      }

      return {
        success: true,
        config,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse configuration data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  onConfigChange(callback: (config: AppConfig) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getDefaultConfig(): AppConfig {
    return { ...DEFAULT_APP_CONFIG };
  }

  migrateConfig(oldConfig: any, version: string): AppConfig {
    // For now, just merge with defaults
    // In the future, implement version-specific migration logic
    console.log(`Migrating configuration from version ${version} to ${CONFIG_VERSION}`);
    
    return this.mergeConfig(DEFAULT_APP_CONFIG, oldConfig);
  }

  // Private helper methods
  private loadConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_APP_CONFIG };
      }

      const parsed = JSON.parse(stored);
      const merged = this.mergeConfig(DEFAULT_APP_CONFIG, parsed);
      
      // Validate loaded config
      const validation = this.validateConfig(merged);
      if (!validation.isValid) {
        console.warn('Loaded configuration is invalid, using defaults:', validation.errors);
        return { ...DEFAULT_APP_CONFIG };
      }

      return merged;
    } catch (error) {
      console.error('Failed to load configuration, using defaults:', error);
      return { ...DEFAULT_APP_CONFIG };
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  private mergeConfig(base: AppConfig, updates: any): AppConfig {
    const result = { ...base };

    // Deep merge logic
    if (updates.general) {
      result.general = { ...result.general, ...updates.general };
    }

    if (updates.backlogApi) {
      const currentBacklogApi = result.backlogApi;
      result.backlogApi = {
        enabled: false,
        autoFetchIssueDetails: false,
        autoUploadScreenshots: false,
        ...currentBacklogApi,
        ...updates.backlogApi
      };
      
      // Handle config separately to avoid type issues
      if (updates.backlogApi.config) {
        if (!result.backlogApi) {
          result.backlogApi = {
            enabled: false,
            autoFetchIssueDetails: false,
            autoUploadScreenshots: false
          };
        }
        result.backlogApi.config = {
          ...(currentBacklogApi?.config || {}),
          ...updates.backlogApi.config
        };
      }
    }

    if (updates.defaults) {
      result.defaults = { ...result.defaults, ...updates.defaults };
    }

    if (updates.ui) {
      result.ui = { ...result.ui, ...updates.ui };
    }

    if (updates.advanced) {
      result.advanced = { ...result.advanced, ...updates.advanced };
    }

    return result;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }

  // Utility methods for specific config operations
  updateGeneralSetting<K extends keyof AppConfig['general']>(
    key: K, 
    value: AppConfig['general'][K]
  ): void {
    this.updateConfig({
      general: {
        ...this.config.general,
        [key]: value
      }
    });
  }

  updateDefaultSetting<K extends keyof AppConfig['defaults']>(
    key: K, 
    value: AppConfig['defaults'][K]
  ): void {
    this.updateConfig({
      defaults: {
        ...this.config.defaults,
        [key]: value
      }
    });
  }

  updateUISetting<K extends keyof AppConfig['ui']>(
    key: K, 
    value: AppConfig['ui'][K]
  ): void {
    this.updateConfig({
      ui: {
        ...this.config.ui,
        [key]: value
      }
    });
  }

  updateAdvancedSetting<K extends keyof AppConfig['advanced']>(
    key: K, 
    value: AppConfig['advanced'][K]
  ): void {
    this.updateConfig({
      advanced: {
        ...this.config.advanced,
        [key]: value
      }
    });
  }

  // Backlog API specific methods
  enableBacklogApi(apiConfig: BacklogApiConfig): void {
    const currentBacklogApi = this.config.backlogApi;
    
    this.updateConfig({
      backlogApi: {
        enabled: true,
        config: apiConfig,
        autoFetchIssueDetails: currentBacklogApi?.autoFetchIssueDetails ?? false,
        autoUploadScreenshots: currentBacklogApi?.autoUploadScreenshots ?? false
      }
    });
  }

  disableBacklogApi(): void {
    this.updateConfig({
      backlogApi: {
        enabled: false,
        autoFetchIssueDetails: false,
        autoUploadScreenshots: false
      }
    });
  }

  // Authentication state management
  updateBacklogAuthConfig(config: BacklogApiConfig): void {
    const currentBacklogApi = this.config.backlogApi || {
      enabled: false,
      autoFetchIssueDetails: false,
      autoUploadScreenshots: false
    };
    
    this.updateConfig({
      backlogApi: {
        ...currentBacklogApi,
        enabled: true,
        config: config
      }
    });
  }

  clearBacklogAuthConfig(): void {
    const currentBacklogApi = this.config.backlogApi;
    if (currentBacklogApi) {
      this.updateConfig({
        backlogApi: {
          ...currentBacklogApi,
          enabled: false,
          config: undefined
        }
      });
    }
  }

  getBacklogAuthConfig(): BacklogApiConfig | null {
    return this.config.backlogApi?.config || null;
  }

  // Debug and utility methods
  getConfigSummary(): Record<string, any> {
    return {
      version: CONFIG_VERSION,
      language: this.config.general.language,
      theme: this.config.general.theme,
      autoSave: this.config.general.autoSave,
      backlogApiEnabled: this.config.backlogApi?.enabled ?? false,
      defaultPriority: this.config.defaults.priority,
      compactMode: this.config.ui.compactMode,
      debugMode: this.config.advanced.enableDebugMode
    };
  }

  clearStoredConfig(): void {
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      console.log('Stored configuration cleared');
    } catch (error) {
      console.error('Failed to clear stored configuration:', error);
    }
  }
}

// Singleton instance for global use
export const configManager = new ConfigManagerImpl();

// Utility functions for configuration management
export const ConfigUtils = {
  /**
   * Get a nested configuration value by path
   */
  getConfigValue<T>(config: AppConfig, path: string): T | undefined {
    return path.split('.').reduce((obj: any, key) => obj?.[key], config);
  },

  /**
   * Set a nested configuration value by path
   */
  setConfigValue(config: AppConfig, path: string, value: any): AppConfig {
    const keys = path.split('.');
    const result = { ...config };
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  },

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(config: AppConfig, feature: string): boolean {
    switch (feature) {
      case 'backlogApi':
        return config.backlogApi?.enabled ?? false;
      case 'autoSave':
        return config.general.autoSave;
      case 'notifications':
        return config.general.showNotifications;
      case 'debugMode':
        return config.advanced.enableDebugMode;
      default:
        return false;
    }
  },

  /**
   * Get file size limit in bytes
   */
  getMaxFileSizeBytes(config: AppConfig): number {
    return config.advanced.maxFileSize * 1024 * 1024;
  },

  /**
   * Check if file type is allowed
   */
  isFileTypeAllowed(config: AppConfig, fileType: string): boolean {
    return config.advanced.allowedFileTypes.includes(fileType);
  }
};