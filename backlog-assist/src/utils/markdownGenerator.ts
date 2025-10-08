import type { ChecklistItem, ReportData } from '../types';

export const generateMarkdown = (checklist: ChecklistItem[], reportData: ReportData): string => {
  // Placeholder implementation - will be implemented in later tasks
  return `# 課題レビュー報告

## 基本情報

* **課題番号**: ${reportData.issueNumber}
* **優先度**: ${reportData.priority}
* **カテゴリ**: ${reportData.category}

## チェックリスト結果

${checklist.map(item => `* [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n')}

## 詳細説明

${reportData.description}
`;
};