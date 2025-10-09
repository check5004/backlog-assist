import React, { useState, useEffect } from 'react';
import type { ChecklistItem, ReportData } from '../../types';
import { generateMarkdown } from '../../utils/markdownGenerator';

interface MarkdownOutputProps {
  checklist: ChecklistItem[];
  reportData: ReportData;
  onCopyToClipboard: () => void;
}

const MarkdownOutput: React.FC<MarkdownOutputProps> = ({
  checklist,
  reportData,
  onCopyToClipboard
}) => {
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Generate markdown whenever checklist or reportData changes
  useEffect(() => {
    const markdown = generateMarkdown(checklist, reportData);
    setGeneratedMarkdown(markdown);
  }, [checklist, reportData]);

  // Handle copy to clipboard functionality
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopySuccess(true);
      onCopyToClipboard();
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedMarkdown;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        onCopyToClipboard();
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          マークダウン出力
        </h3>
        <button
          onClick={handleCopyToClipboard}
          disabled={!generatedMarkdown.trim()}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            copySuccess
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
          }`}
        >
          {copySuccess ? '✓ コピー完了' : 'クリップボードにコピー'}
        </button>
      </div>

      {/* Markdown Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー:</h4>
        <div className="border rounded-md bg-gray-50 p-4 max-h-96 overflow-y-auto">
          {generatedMarkdown ? (
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {generatedMarkdown}
            </pre>
          ) : (
            <p className="text-gray-500 italic">
              チェックリストまたは報告データを入力すると、マークダウンが生成されます
            </p>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
        <p className="font-medium mb-1">使用方法:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>上記のマークダウンをクリップボードにコピーしてください</li>
          <li>Backlogの課題コメント欄に貼り付けてください</li>
          <li>マークダウンはBacklog記法に準拠しており、適切に表示されます</li>
        </ul>
      </div>

      {/* Statistics */}
      {checklist.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 border-t pt-3">
          <div className="flex justify-between">
            <span>
              チェックリスト項目: {checklist.filter(item => item.checked).length} / {checklist.length} 完了
            </span>
            <span>
              文字数: {generatedMarkdown.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownOutput;