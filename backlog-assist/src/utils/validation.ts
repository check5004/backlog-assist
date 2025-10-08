import type { ReportData, ValidationError } from '../types';

export const validateReportData = (data: ReportData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.issueNumber) {
    errors.push({
      field: 'issueNumber',
      message: '課題番号は必須です',
      type: 'required'
    });
  }
  
  if (data.issueNumber && !/^[A-Z]+-\d+$/.test(data.issueNumber)) {
    errors.push({
      field: 'issueNumber',
      message: '課題番号の形式が正しくありません（例：PROJ-123）',
      type: 'format'
    });
  }
  
  return errors;
};