// Backlog Authentication Component
// Placeholder for future API integration

import { useState } from 'react';
import type { BacklogApiConfig, BacklogUser, BacklogApiError } from '../../types/backlogApi';
import { backlogApiClient, BacklogApiUtils } from '../../utils/backlogApiClient';

interface BacklogAuthProps {
  onAuthSuccess?: (user: BacklogUser) => void;
  onAuthError?: (error: BacklogApiError) => void;
  onConfigChange?: (config: BacklogApiConfig | null) => void;
}

export default function BacklogAuth({ 
  onAuthSuccess, 
  onAuthError, 
  onConfigChange 
}: BacklogAuthProps) {
  const [config, setConfig] = useState<BacklogApiConfig>({
    baseUrl: '',
    apiKey: '',
    projectKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<BacklogUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleInputChange = (field: keyof BacklogApiConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    setError(null);
  };

  const validateConfig = (): string | null => {
    if (!config.baseUrl.trim()) {
      return 'Backlog URLを入力してください';
    }
    
    if (!config.baseUrl.match(/^https?:\/\/[^.]+\.backlog\.(jp|com|tool)/)) {
      return 'Backlog URLの形式が正しくありません（例: https://your-space.backlog.jp）';
    }
    
    if (!config.apiKey.trim()) {
      return 'APIキーを入力してください';
    }
    
    return null;
  };

  const handleAuthenticate = async () => {
    const validationError = validateConfig();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Configure the API client
      backlogApiClient.configure(config);
      
      // Attempt authentication
      const response = await backlogApiClient.authenticate();
      
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setCurrentUser(response.data);
        onAuthSuccess?.(response.data);
      } else {
        const errorMessage = response.error?.message || '認証に失敗しました';
        setError(errorMessage);
        onAuthError?.(response.error!);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      onAuthError?.({ message: errorMessage, code: 'UNEXPECTED_ERROR' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    backlogApiClient.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setError(null);
    onConfigChange?.(null);
  };

  const spaceName = config.baseUrl ? BacklogApiUtils.extractSpaceName(config.baseUrl) : null;

  if (isAuthenticated && currentUser) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Backlog API 接続済み
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">接続中</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">ユーザー:</span>
              <span className="text-gray-600">{currentUser.name} ({currentUser.userId})</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">スペース:</span>
              <span className="text-gray-600">{spaceName || 'Unknown'}</span>
            </div>
            {config.projectKey && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">プロジェクト:</span>
                <span className="text-gray-600">{config.projectKey}</span>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              接続を解除
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Backlog API 設定
        </h3>
        <p className="text-sm text-gray-600">
          将来の機能拡張のためのAPI設定です。現在はプレースホルダーとして動作します。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="backlog-url" className="block text-sm font-medium text-gray-700 mb-1">
            Backlog URL
          </label>
          <input
            id="backlog-url"
            type="url"
            value={config.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
            placeholder="https://your-space.backlog.jp"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          {spaceName && (
            <p className="mt-1 text-xs text-gray-500">
              スペース名: {spaceName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
            APIキー
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="APIキーを入力してください"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showApiKey ? (
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            BacklogのAPIキーは個人設定から取得できます
          </p>
        </div>

        <div>
          <label htmlFor="project-key" className="block text-sm font-medium text-gray-700 mb-1">
            プロジェクトキー（オプション）
          </label>
          <input
            id="project-key"
            type="text"
            value={config.projectKey || ''}
            onChange={(e) => handleInputChange('projectKey', e.target.value)}
            placeholder="PROJ"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            デフォルトで使用するプロジェクトキー
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleAuthenticate}
            disabled={isLoading || !config.baseUrl || !config.apiKey}
            className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                接続中...
              </>
            ) : (
              '接続テスト'
            )}
          </button>
        </div>

        <div className="pt-4 border-t">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>注意:</strong> これは将来の機能拡張のためのプレースホルダーです。
                  現在は実際のBacklog APIには接続されません。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}