import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BacklogUser, BacklogApiConfig, BacklogApiError } from '../types/backlogApi';
import { backlogApiClient } from '../utils/backlogApiClient';
import { configManager } from '../utils/configManager';

interface BacklogAuthState {
  isAuthenticated: boolean;
  currentUser: BacklogUser | null;
  config: BacklogApiConfig | null;
  isLoading: boolean;
  error: BacklogApiError | null;
}

interface BacklogAuthActions {
  authenticate: (config: BacklogApiConfig) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateConfig: (config: BacklogApiConfig) => void;
}

interface BacklogAuthContextType extends BacklogAuthState, BacklogAuthActions {}

const BacklogAuthContext = createContext<BacklogAuthContextType | undefined>(undefined);

interface BacklogAuthProviderProps {
  children: ReactNode;
}

export function BacklogAuthProvider({ children }: BacklogAuthProviderProps) {
  const [state, setState] = useState<BacklogAuthState>({
    isAuthenticated: false,
    currentUser: null,
    config: null,
    isLoading: false,
    error: null
  });

  // Load saved authentication state on mount
  useEffect(() => {
    const appConfig = configManager.getConfig();
    if (appConfig.backlogApi?.enabled && appConfig.backlogApi.config) {
      setState(prev => ({
        ...prev,
        config: appConfig.backlogApi!.config!
      }));
      
      // Try to restore authentication if we have saved config
      if (appConfig.backlogApi.config.apiKey) {
        // Auto-authenticate with saved config
        authenticate(appConfig.backlogApi.config);
      }
    }
  }, []);

  const authenticate = async (config: BacklogApiConfig): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Configure the API client
      backlogApiClient.configure(config);
      
      // Attempt authentication
      const response = await backlogApiClient.authenticate();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          currentUser: response.data!,
          config,
          isLoading: false,
          error: null
        }));

        // Save authentication config to app settings
        configManager.updateBacklogAuthConfig(config);
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          currentUser: null,
          isLoading: false,
          error: response.error || { message: '認証に失敗しました', code: 'AUTH_FAILED' }
        }));
        
        return false;
      }
    } catch (error) {
      const authError: BacklogApiError = {
        message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        code: 'UNEXPECTED_ERROR'
      };
      
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
        error: authError
      }));
      
      return false;
    }
  };

  const logout = () => {
    backlogApiClient.logout();
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
      config: null,
      error: null
    }));

    // Clear Backlog authentication config
    configManager.clearBacklogAuthConfig();
  };

  const clearError = () => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  };

  const updateConfig = (config: BacklogApiConfig) => {
    setState(prev => ({
      ...prev,
      config
    }));
  };

  const contextValue: BacklogAuthContextType = {
    ...state,
    authenticate,
    logout,
    clearError,
    updateConfig
  };

  return (
    <BacklogAuthContext.Provider value={contextValue}>
      {children}
    </BacklogAuthContext.Provider>
  );
}

export function useBacklogAuth(): BacklogAuthContextType {
  const context = useContext(BacklogAuthContext);
  if (context === undefined) {
    throw new Error('useBacklogAuth must be used within a BacklogAuthProvider');
  }
  return context;
}

// Utility hook for checking if Backlog integration is available
export function useBacklogIntegration() {
  const { isAuthenticated, currentUser, config } = useBacklogAuth();
  
  return {
    isAvailable: isAuthenticated && currentUser !== null,
    user: currentUser,
    config,
    spaceName: config ? config.baseUrl.match(/https?:\/\/([^.]+)\.backlog\.(jp|com|tool)/)?.[1] : null
  };
}