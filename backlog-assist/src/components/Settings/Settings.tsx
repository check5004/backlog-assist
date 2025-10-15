// Settings Component - Configuration Management System
import { useState } from 'react';
import BacklogAuth from '../BacklogAuth/BacklogAuth';

interface SettingsProps {
  onClose?: () => void;
  initialTab?: 'general' | 'backlog';
}

function Settings({ onClose, initialTab = 'general' }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'backlog'>(initialTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area - Flexible */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                一般設定
              </button>
              <button
                onClick={() => setActiveTab('backlog')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'backlog'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Backlog連携
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">一般設定</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      設定管理システムが実装されました。将来のバージョンでより多くの設定オプションが追加される予定です。
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">実装済み機能:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 設定データの保存・読み込み</li>
                        <li>• 設定の検証とエラーハンドリング</li>
                        <li>• 設定のインポート・エクスポート</li>
                        <li>• Backlog API認証機能</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">今後追加予定:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 詳細な設定UI</li>
                        <li>• テーマ設定</li>
                        <li>• 言語設定</li>
                        <li>• 通知設定</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backlog' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backlog API連携</h3>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Backlog APIと連携することで、課題の詳細取得やコメント投稿などの機能を利用できます。
                    </p>
                    
                    <BacklogAuth />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;