import { AppProvider, useAppContext } from './contexts';
import ChecklistGenerator from './components/ChecklistGenerator/ChecklistGenerator';
import type { RuleSet, ChecklistItem } from './types';

// Main app content component that uses the context
function AppContent() {
  const { state } = useAppContext();
  
  // Handle rule set change from ChecklistGenerator
  const handleRuleSetChange = (ruleSet: RuleSet | null) => {
    // The context already handles this through setRuleSet
    console.log('Rule set changed:', ruleSet?.name || 'Reset');
  };

  // Handle checklist update from ChecklistGenerator
  const handleChecklistUpdate = (checklist: ChecklistItem[]) => {
    // The context already handles this through updateChecklistItem
    console.log('Checklist updated:', checklist.filter(item => item.checked).length, 'items checked');
  };
  
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
        <div className="space-y-8">
          {/* Checklist Generator Section */}
          <ChecklistGenerator
            selectedRuleSet={state.selectedRuleSet}
            onRuleSetChange={handleRuleSetChange}
            onChecklistUpdate={handleChecklistUpdate}
          />
          
          {/* Status Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              実装状況
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">✅ Context & Reducer</h3>
                <p className="text-sm text-gray-600">状態管理システム</p>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-900">✅ ChecklistGenerator</h3>
                <p className="text-sm text-blue-700">チェックリスト生成機能</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">⏳ ReportForm</h3>
                <p className="text-sm text-gray-600">報告フォーム（未実装）</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">⏳ MarkdownOutput</h3>
                <p className="text-sm text-gray-600">マークダウン出力（未実装）</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">⏳ Integration</h3>
                <p className="text-sm text-gray-600">統合機能（未実装）</p>
              </div>
            </div>
            
            {/* Current State Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">現在の状態</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">選択されたルールセット:</span></p>
                  <p className="text-gray-600">{state.selectedRuleSet?.name || '未選択'}</p>
                </div>
                <div>
                  <p><span className="font-medium">チェックリスト進捗:</span></p>
                  <p className="text-gray-600">
                    {state.checklist.length > 0 
                      ? `${state.checklist.filter(item => item.checked).length} / ${state.checklist.length} 完了`
                      : 'チェックリスト未生成'
                    }
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">利用可能なルールセット:</span></p>
                  <p className="text-gray-600">{state.availableRuleSets.length} セット</p>
                </div>
                <div>
                  <p><span className="font-medium">課題番号:</span></p>
                  <p className="text-gray-600">{state.reportData.issueNumber || '未入力'}</p>
                </div>
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
