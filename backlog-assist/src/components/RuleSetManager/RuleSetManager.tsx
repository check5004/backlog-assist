import React, { useState, useEffect } from 'react';
import type { RuleSet, ValidationError } from '../../types';
import { useAppContext } from '../../contexts';
import { localStorageUtils } from '../../utils/localStorage';

interface RuleSetManagerProps {
  onRuleSetSelect?: (ruleSet: RuleSet) => void;
  showManagementFeatures?: boolean;
}

const RuleSetManager: React.FC<RuleSetManagerProps> = ({
  onRuleSetSelect,
  showManagementFeatures = false
}) => {
  const { state, dispatch } = useAppContext();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load rule sets from localStorage on component mount
  useEffect(() => {
    loadRuleSetsFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const loadRuleSetsFromStorage = async () => {
    setIsLoading(true);
    try {
      const storedRuleSets = localStorageUtils.getRuleSets();
      
      // Validate data integrity
      if (!localStorageUtils.validateStoredData()) {
        setValidationErrors([{
          field: 'storage',
          message: 'ストレージデータの整合性に問題があります',
          type: 'format'
        }]);
        return;
      }

      // Merge stored rule sets with default rule sets
      const allRuleSets = [...state.availableRuleSets];
      
      // Add stored rule sets that don't exist in defaults
      storedRuleSets.forEach(storedRuleSet => {
        const existsInDefaults = allRuleSets.some(rs => rs.id === storedRuleSet.id);
        if (!existsInDefaults) {
          allRuleSets.push(storedRuleSet);
        }
      });

      dispatch({ type: 'SET_AVAILABLE_RULE_SETS', payload: allRuleSets });
      setValidationErrors([]);
    } catch (error) {
      console.error('Failed to load rule sets:', error);
      setValidationErrors([{
        field: 'storage',
        message: 'ルールセットの読み込みに失敗しました',
        type: 'format'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateRuleSet = (ruleSet: RuleSet): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!ruleSet.id || ruleSet.id.trim() === '') {
      errors.push({
        field: 'id',
        message: 'ルールセットIDは必須です',
        type: 'required'
      });
    }

    if (!ruleSet.name || ruleSet.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'ルールセット名は必須です',
        type: 'required'
      });
    }

    if (!ruleSet.rules || ruleSet.rules.length === 0) {
      errors.push({
        field: 'rules',
        message: 'ルールセットには少なくとも1つのルールが必要です',
        type: 'required'
      });
    }

    // Validate individual rules
    ruleSet.rules?.forEach((rule, index) => {
      if (!rule.id || rule.id.trim() === '') {
        errors.push({
          field: `rules.${index}.id`,
          message: `ルール${index + 1}: IDは必須です`,
          type: 'required'
        });
      }

      if (!rule.text || rule.text.trim() === '') {
        errors.push({
          field: `rules.${index}.text`,
          message: `ルール${index + 1}: テキストは必須です`,
          type: 'required'
        });
      }

      if (!rule.category || rule.category.trim() === '') {
        errors.push({
          field: `rules.${index}.category`,
          message: `ルール${index + 1}: カテゴリは必須です`,
          type: 'required'
        });
      }
    });

    return errors;
  };

  const handleRuleSetSelect = (ruleSet: RuleSet) => {
    const errors = validateRuleSet(ruleSet);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onRuleSetSelect?.(ruleSet);
  };

  const handleDeleteRuleSet = (ruleSetId: string) => {
    if (window.confirm('このルールセットを削除してもよろしいですか？')) {
      try {
        localStorageUtils.removeRuleSet(ruleSetId);
        
        // Update state
        const updatedRuleSets = state.availableRuleSets.filter(rs => rs.id !== ruleSetId);
        dispatch({ type: 'SET_AVAILABLE_RULE_SETS', payload: updatedRuleSets });
        
        // Reset selected rule set if it was deleted
        if (state.selectedRuleSet?.id === ruleSetId) {
          dispatch({ type: 'RESET_RULE_SET' });
        }
      } catch (error) {
        console.error('Failed to delete rule set:', error);
        setValidationErrors([{
          field: 'delete',
          message: 'ルールセットの削除に失敗しました',
          type: 'format'
        }]);
      }
    }
  };

  const handleExportRuleSet = (ruleSet: RuleSet) => {
    try {
      const dataStr = JSON.stringify(ruleSet, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${ruleSet.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export rule set:', error);
      setValidationErrors([{
        field: 'export',
        message: 'ルールセットのエクスポートに失敗しました',
        type: 'format'
      }]);
    }
  };

  const isCustomRuleSet = (ruleSet: RuleSet): boolean => {
    // Check if this is a custom rule set (not one of the default ones)
    const defaultIds = ['figma-design-rules', 'code-review-rules', 'ui-test-rules'];
    return !defaultIds.includes(ruleSet.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">ルールセットを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">エラーが発生しました</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule Set List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              利用可能なルールセット
            </h3>
            <div className="text-sm text-gray-600">
              {state.availableRuleSets.length} セット
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {state.availableRuleSets.map((ruleSet) => (
            <div key={ruleSet.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{ruleSet.name}</h4>
                    {isCustomRuleSet(ruleSet) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        カスタム
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{ruleSet.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <span>{ruleSet.rules.length} 項目</span>
                    <span>バージョン {ruleSet.version}</span>
                    <span>更新日: {ruleSet.updatedAt.toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleRuleSetSelect(ruleSet)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    選択
                  </button>
                  
                  {showManagementFeatures && (
                    <>
                      <button
                        onClick={() => handleExportRuleSet(ruleSet)}
                        className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        エクスポート
                      </button>
                      
                      {isCustomRuleSet(ruleSet) && (
                        <button
                          onClick={() => handleDeleteRuleSet(ruleSet.id)}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Rule Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-700 mb-2">ルール一覧</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ruleSet.rules.slice(0, 4).map((rule) => (
                    <div key={rule.id} className="text-xs text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      <span className="truncate">{rule.text}</span>
                    </div>
                  ))}
                  {ruleSet.rules.length > 4 && (
                    <div className="text-xs text-gray-500 italic">
                      他 {ruleSet.rules.length - 4} 項目...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {state.availableRuleSets.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">ルールセットがありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              利用可能なルールセットが見つかりませんでした
            </p>
          </div>
        )}
      </div>

      {/* Management Actions */}
      {showManagementFeatures && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">管理機能</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadRuleSetsFromStorage}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              再読み込み
            </button>
            <button
              onClick={() => {
                if (window.confirm('すべてのカスタムルールセットを削除してもよろしいですか？')) {
                  localStorageUtils.clearAllData();
                  loadRuleSetsFromStorage();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              すべてクリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleSetManager;