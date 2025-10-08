import React from 'react';
import type { ReportData, ValidationError } from '../../types';

interface ReportFormProps {
  reportData: ReportData;
  onReportDataChange: (data: ReportData) => void;
  onValidationError: (errors: ValidationError[]) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({
  reportData: _reportData,
  onReportDataChange: _onReportDataChange,
  onValidationError: _onValidationError
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        報告フォーム
      </h3>
      <p className="text-gray-600">
        報告フォーム機能は後のタスクで実装されます
      </p>
    </div>
  );
};

export default ReportForm;