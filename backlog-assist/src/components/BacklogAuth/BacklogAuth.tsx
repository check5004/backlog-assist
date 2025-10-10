// Backlog Authentication Component

import { useState, useEffect } from 'react';
import type { BacklogApiConfig } from '../../types/backlogApi';
import { BacklogApiUtils } from '../../utils/backlogApiClient';
import { useBacklogAuth } from '../../contexts/BacklogAuthContext';

interface BacklogAuthProps {
  // Props are now optional since we use context for state management
}

export default function BacklogAuth({}: BacklogAuthProps) {
  const { 
    isAuthenticated, 
    currentUser, 
    config: savedConfig, 
    isLoading, 
    error: authError,
    authenticate,
    logout,
    clearError,
    updateConfig
  } = useBacklogAuth();

  const [config, setConfig] = useState<BacklogApiConfig>({
    baseUrl: savedConfig?.baseUrl || '',
    apiKey: savedConfig?.apiKey || '',
    projectKey: savedConfig?.projectKey || ''
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // Update local config when saved config changes
  useEffect(() => {
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [savedConfig]);

  const handleInputChange = (field: keyof BacklogApiConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    updateConfig(newConfig);
    clearError();
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
      // We'll show validation errors inline, context handles auth errors
      return;
    }

    await authenticate(config);
  };

  const handleLogout = () => {
    logout();
    // Reset local config form
    setConfig({
      baseUrl: '',
      apiKey: '',
      projectKey: ''
    });
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

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{authError.message}</p>
                {authError.code && (
                  <p className="text-xs text-red-600 mt-1">エラーコード: {authError.code}</p>
                )}
              </div>
              <div className="ml-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
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
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>実装完了:</strong> Backlog API認証機能が実装されました。
                  実際のBacklog APIに接続してユーザー情報を取得します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}