import React from 'react';
import type { ChecklistItem, ReportData } from '../../types';

interface MarkdownOutputProps {
  checklist: ChecklistItem[];
  reportData: ReportData;
  onCopyToClipboard: () => void;
}

const MarkdownOutput: React.FC<MarkdownOutputProps> = ({
  checklist: _checklist,
  reportData: _reportData,
  onCopyToClipboard: _onCopyToClipboard
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        マークダウン出力
      </h3>
      <p className="text-gray-600">
        マークダウン出力機能は後のタスクで実装されます
      </p>
    </div>
  );
};

export default MarkdownOutput;