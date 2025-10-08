import { AppProvider, useAppContext } from './contexts';

// Main app content component that uses the context
function AppContent() {
  const { state } = useAppContext();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Backlog Assist
            </h1>
            <p className="text-sm text-gray-600">
              課題報告支援ツール
            </p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            状態管理システム実装完了
          </h2>
          <p className="text-gray-600 mb-4">
            React Context + useReducer による状態管理システムが実装されました。
          </p>
          
          {/* Display current state information */}
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">現在の状態</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">選択されたルールセット:</span> {state.selectedRuleSet?.name || '未選択'}</p>
                <p><span className="font-medium">利用可能なルールセット数:</span> {state.availableRuleSets.length}</p>
                <p><span className="font-medium">チェックリスト項目数:</span> {state.checklist.length}</p>
                <p><span className="font-medium">課題番号:</span> {state.reportData.issueNumber || '未入力'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Context</h3>
                <p className="text-sm text-gray-600">状態管理コンテキスト</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Reducer</h3>
                <p className="text-sm text-gray-600">状態更新ロジック</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Actions</h3>
                <p className="text-sm text-gray-600">アクション定義</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Helper Functions</h3>
                <p className="text-sm text-gray-600">便利な操作関数</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Provider</h3>
                <p className="text-sm text-gray-600">コンテキストプロバイダー</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Custom Hook</h3>
                <p className="text-sm text-gray-600">useAppContext フック</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main App component with provider wrapper
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App
