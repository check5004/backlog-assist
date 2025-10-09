import type { ChecklistItem, ReportData } from '../types';

/**
 * Interface for markdown generation functionality
 */
export interface MarkdownGenerator {
  generateBasicInfo(reportData: ReportData): string;
  generateChecklistResults(checklist: ChecklistItem[]): string;
  generateAttachments(screenshots: File[]): string;
  generateDescription(description: string): string;
  generateRelatedIssues(relatedIssues: string[]): string;
}

/**
 * BacklogMarkdownGenerator - Generates Backlog-compliant markdown from checklist and report data
 * 
 * This class implements the Backlog-specific markdown format including:
 * - Proper heading structure using # notation
 * - Checklist format using * [ ] and * [x]
 * - Section separators using -----
 * - Japanese labels and formatting
 * - Related issue links using [[ISSUE-KEY]] format
 */
export class BacklogMarkdownGenerator implements MarkdownGenerator {
  
  /**
   * Generates the basic information section with issue details
   */
  generateBasicInfo(reportData: ReportData): string {
    const now = new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const sections = [
      '## 基本情報',
      '',
      `* **課題番号**: ${reportData.issueNumber || '未設定'}`,
      `* **優先度**: ${this.getPriorityLabel(reportData.priority)}`,
      `* **カテゴリ**: ${reportData.category || '未設定'}`,
      `* **報告日時**: ${now}`
    ];
    
    return sections.join('\n');
  }
  
  /**
   * Generates checklist results grouped by category
   */
  generateChecklistResults(checklist: ChecklistItem[]): string {
    if (checklist.length === 0) {
      return '## チェックリスト結果\n\n*チェックリストが選択されていません*';
    }
    
    const groupedItems = this.groupByCategory(checklist);
    const sections: string[] = [];
    
    Object.entries(groupedItems).forEach(([category, items]) => {
      const itemList = items.map(item => 
        `* [${item.checked ? 'x' : ' '}] ${item.text}`
      ).join('\n');
      
      sections.push([
        `### ${category}`,
        '',
        itemList
      ].join('\n'));
    });
    
    return ['## チェックリスト結果', '', ...sections].join('\n\n');
  }
  
  /**
   * Generates attachment file list
   */
  generateAttachments(screenshots: File[]): string {
    if (screenshots.length === 0) {
      return '## 添付ファイル\n\n*添付ファイルはありません*';
    }
    
    const fileList = screenshots.map(file => `* ${file.name}`).join('\n');
    return ['## 添付ファイル', '', fileList].join('\n');
  }
  
  /**
   * Generates description section
   */
  generateDescription(description: string): string {
    if (!description.trim()) {
      return '## 詳細説明\n\n*詳細説明は記載されていません*';
    }
    
    return ['## 詳細説明', '', description.trim()].join('\n');
  }
  
  /**
   * Generates related issues section with Backlog link format
   */
  generateRelatedIssues(relatedIssues: string[]): string {
    if (!relatedIssues || relatedIssues.length === 0) {
      return '';
    }
    
    const issueLinks = relatedIssues
      .filter(issue => issue.trim()) // Remove empty strings
      .map(issue => `[[${issue.trim()}]]`)
      .join(' ');
    
    if (!issueLinks) {
      return '';
    }
    
    return ['## 関連課題', '', issueLinks].join('\n');
  }
  
  /**
   * Converts priority enum to Japanese label
   */
  private getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = { 
      low: '低', 
      medium: '中', 
      high: '高' 
    };
    return labels[priority] || priority;
  }
  
  /**
   * Groups checklist items by category
   */
  private groupByCategory(checklist: ChecklistItem[]): Record<string, ChecklistItem[]> {
    return checklist.reduce((groups, item) => {
      const category = item.category || 'その他';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, ChecklistItem[]>);
  }
}

/**
 * Main function to generate complete markdown document
 */
export const generateMarkdown = (checklist: ChecklistItem[], reportData: ReportData): string => {
  const generator = new BacklogMarkdownGenerator();
  
  const sections = [
    '# 課題レビュー報告',
    '',
    generator.generateBasicInfo(reportData),
    '-----',
    '',
    generator.generateChecklistResults(checklist),
    '-----',
    '',
    generator.generateAttachments(reportData.screenshots),
    '-----',
    '',
    generator.generateDescription(reportData.description)
  ];
  
  // Add related issues section if it exists
  const relatedIssuesSection = generator.generateRelatedIssues(reportData.relatedIssues || []);
  if (relatedIssuesSection) {
    sections.push('-----', '', relatedIssuesSection);
  }
  
  return sections.join('\n');
};