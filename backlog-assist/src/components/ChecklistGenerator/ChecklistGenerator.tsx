import React, { useState } from 'react';
import type { RuleSet, ChecklistItem } from '../../types';
import { useAppContext } from '../../contexts';
import RuleSetManager from '../RuleSetManager';

interface ChecklistGeneratorProps {
  selectedRuleSet: RuleSet | null;
  onRuleSetChange: (ruleSet: RuleSet | null) => void;
  onChecklistUpdate: (checklist: ChecklistItem[]) => void;
}

const ChecklistGenerator: React.FC<ChecklistGeneratorProps> = ({
  selectedRuleSet,
  onRuleSetChange,
  onChecklistUpdate
}) => {
  const { state, setRuleSet, updateChecklistItem } = useAppContext();
  const [showRuleSetManager, setShowRuleSetManager] = useState(false);

  // Handle rule set selection
  const handleRuleSetSelect = (ruleSet: RuleSet) => {
    setRuleSet(ruleSet);
    onRuleSetChange(ruleSet);
  };

  // Handle rule set selection from RuleSetManager
  const handleRuleSetManagerSelect = (ruleSet: RuleSet) => {
    handleRuleSetSelect(ruleSet);
    setShowRuleSetManager(false); // Close manager after selection
  };

  // Handle individual checklist item toggle
  const handleChecklistItemToggle = (itemId: string, checked: boolean) => {
    updateChecklistItem(itemId, checked);
    // Update parent component with the new checklist
    const updatedChecklist = state.checklist.map(item =>
      item.id === itemId ? { ...item, checked } : item
    );
    onChecklistUpdate(updatedChecklist);
  };

  // Group checklist items by category
  const groupedChecklist = state.checklist.reduce((groups, item) => {
    const category = item.category || 'その他';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Rule Set Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            ルールセット選択
          </h3>
          <button
            onClick={() => setShowRuleSetManager(!showRuleSetManager)}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            {showRuleSetManager ? '簡易表示' : '管理画面'}
          </button>
        </div>
        
        {showRuleSetManager ? (
          <RuleSetManager
            onRuleSetSelect={handleRuleSetManagerSelect}
            showManagementFeatures={true}
          />
        ) : (
          <>
            {!selectedRuleSet ? (
              <div className="space-y-3">
                <p className="text-gray-600 mb-4">
                  チェックリスト生成用のルールセットを選択してください
                </p>
                <div className="grid gap-3">
                  {state.availableRuleSets.map((ruleSet) => (
                    <button
                      key={ruleSet.id}
                      onClick={() => handleRuleSetSelect(ruleSet)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{ruleSet.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{ruleSet.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {ruleSet.rules.length} 項目 • バージョン {ruleSet.version}
                      </div>
                    </button>
                  ))}
                </div>
                
                {state.availableRuleSets.length > 3 && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowRuleSetManager(true)}
                      className="w-full p-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                    >
                      すべてのルールセットを表示 ({state.availableRuleSets.length} セット)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="font-medium text-blue-900">{selectedRuleSet.name}</div>
                  <div className="text-sm text-blue-700">{selectedRuleSet.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowRuleSetManager(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    管理
                  </button>
                  <button
                    onClick={() => {
                      setRuleSet(null); // Reset rule set
                      onRuleSetChange(null); // Reset rule set selection
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    変更
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generated Checklist */}
      {selectedRuleSet && state.checklist.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              チェックリスト
            </h3>
            <div className="text-sm text-gray-600">
              {state.checklist.filter(item => item.checked).length} / {state.checklist.length} 完了
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => handleChecklistItemToggle(item.id, e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.text}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">進捗状況</span>
              <span className="font-medium text-gray-900">
                {Math.round((state.checklist.filter(item => item.checked).length / state.checklist.length) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(state.checklist.filter(item => item.checked).length / state.checklist.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedRuleSet && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">チェックリストを生成</h3>
          <p className="text-gray-600">
            上記からルールセットを選択してチェックリストを生成してください
          </p>
        </div>
      )}
    </div>
  );
};

export default ChecklistGenerator;