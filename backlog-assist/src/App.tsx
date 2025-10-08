function App() {
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
            プロジェクト初期設定完了
          </h2>
          <p className="text-gray-600">
            Vite + React + TypeScript + Tailwind CSS の基本構造が作成されました。
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Components</h3>
              <p className="text-sm text-gray-600">UIコンポーネント</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Contexts</h3>
              <p className="text-sm text-gray-600">状態管理</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Types</h3>
              <p className="text-sm text-gray-600">型定義</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Utils</h3>
              <p className="text-sm text-gray-600">ユーティリティ関数</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Data</h3>
              <p className="text-sm text-gray-600">初期データ</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
