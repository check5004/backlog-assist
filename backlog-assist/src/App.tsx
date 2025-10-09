import React from 'react';
import { AppProvider, useAppContext } from './contexts';
import ChecklistGenerator from './components/ChecklistGenerator/ChecklistGenerator';
import ReportForm from './components/ReportForm/ReportForm';
import MarkdownOutput from './components/MarkdownOutput/MarkdownOutput';
import type { RuleSet, ChecklistItem, ReportData, ValidationError } from './types';
// Import localStorage demo for development testing
import './utils/localStorageDemo';

// Main app content component that uses the context
function AppContent() {
  const { state, updateReportData } = useAppContext();
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle rule set change from ChecklistGenerator
  const handleRuleSetChange = (ruleSet: RuleSet | null) => {
    try {
      setIsLoading(true);
      // The context already handles this through setRuleSet
      console.log('Rule set changed:', ruleSet?.name || 'Reset');
      if (ruleSet) {
        showNotification('success', `ルールセット「${ruleSet.name}」を選択しました`);
      } else {
        showNotification('info', 'ルールセットをリセットしました');
      }
    } catch (error) {
      showNotification('error', 'ルールセットの変更に失敗しました');
      console.error('Rule set change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checklist update from ChecklistGenerator
  const handleChecklistUpdate = (checklist: ChecklistItem[]) => {
    try {
      // The context already handles this through updateChecklistItem
      const completedCount = checklist.filter(item => item.checked).length;
      console.log('Checklist updated:', completedCount, 'items checked');
      
      if (completedCount === checklist.length && checklist.length > 0) {
        showNotification('success', 'すべてのチェックリスト項目が完了しました！');
      }
    } catch (error) {
      showNotification('error', 'チェックリストの更新に失敗しました');
      console.error('Checklist update error:', error);
    }
  };

  // Handle report data changes from ReportForm
  const handleReportDataChange = (data: ReportData) => {
    try {
      updateReportData(data);
    } catch (error) {
      showNotification('error', '報告データの更新に失敗しました');
      console.error('Report data update error:', error);
    }
  };

  // Handle validation errors from ReportForm
  const handleValidationError = (errors: ValidationError[]) => {
    if (errors.length > 0) {
      const errorMessage = errors.length === 1 
        ? `入力エラー: ${errors[0].message}`
        : `${errors.length}件の入力エラーがあります`;
      showNotification('error', errorMessage);
    }
    console.log('Validation errors:', errors);
  };

  // Handle copy to clipboard from MarkdownOutput
  const handleCopyToClipboard = () => {
    showNotification('success', 'マークダウンをクリップボードにコピーしました');
    console.log('Markdown copied to clipboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">処理中...</span>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-40">
          <div className={`rounded-lg p-4 shadow-lg max-w-sm ${
            notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
            notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Forms */}
          <div className="space-y-8">
            {/* Checklist Generator Section */}
            <ChecklistGenerator
              selectedRuleSet={state.selectedRuleSet}
              onRuleSetChange={handleRuleSetChange}
              onChecklistUpdate={handleChecklistUpdate}
            />

            {/* Report Form Section */}
            <ReportForm
              reportData={state.reportData}
              onReportDataChange={handleReportDataChange}
              onValidationError={handleValidationError}
            />
          </div>

          {/* Right Column - Output */}
          <div className="space-y-8">
            {/* Markdown Output Section */}
            <MarkdownOutput
              checklist={state.checklist}
              reportData={state.reportData}
              onCopyToClipboard={handleCopyToClipboard}
            />

            {/* Status Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                現在の状態
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">選択されたルールセット:</span>
                    <span className="text-gray-600">{state.selectedRuleSet?.name || '未選択'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">チェックリスト進捗:</span>
                    <span className="text-gray-600">
                      {state.checklist.length > 0 
                        ? `${state.checklist.filter(item => item.checked).length} / ${state.checklist.length} 完了`
                        : 'チェックリスト未生成'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">課題番号:</span>
                    <span className="text-gray-600">{state.reportData.issueNumber || '未入力'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">利用可能なルールセット:</span>
                    <span className="text-gray-600">{state.availableRuleSets.length} セット</span>
                  </div>
                </div>

                {/* Progress Indicator */}
                {state.checklist.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>完了率</span>
                      <span>{Math.round((state.checklist.filter(item => item.checked).length / state.checklist.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(state.checklist.filter(item => item.checked).length / state.checklist.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
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
