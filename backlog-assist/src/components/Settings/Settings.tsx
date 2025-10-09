// Settings Component - Configuration Management System
interface SettingsProps {
  onClose?: () => void;
}

function Settings({ onClose }: SettingsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              設定管理システムが実装されました。将来のバージョンでより多くの設定オプションが追加される予定です。
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">実装済み機能:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 設定データの保存・読み込み</li>
                <li>• 設定の検証とエラーハンドリング</li>
                <li>• 設定のインポート・エクスポート</li>
                <li>• Backlog API連携の基盤</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">今後追加予定:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 詳細な設定UI</li>
                <li>• テーマ設定</li>
                <li>• 言語設定</li>
                <li>• Backlog API設定画面</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;