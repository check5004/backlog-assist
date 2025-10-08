import React from 'react';
import type { RuleSet, ChecklistItem } from '../../types';

interface ChecklistGeneratorProps {
  selectedRuleSet: RuleSet | null;
  onRuleSetChange: (ruleSet: RuleSet) => void;
  onChecklistUpdate: (checklist: ChecklistItem[]) => void;
}

const ChecklistGenerator: React.FC<ChecklistGeneratorProps> = ({
  selectedRuleSet: _selectedRuleSet,
  onRuleSetChange: _onRuleSetChange,
  onChecklistUpdate: _onChecklistUpdate
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        チェックリスト生成
      </h3>
      <p className="text-gray-600">
        チェックリスト生成機能は後のタスクで実装されます
      </p>
    </div>
  );
};

export default ChecklistGenerator;