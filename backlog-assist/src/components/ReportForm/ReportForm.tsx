import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ReportData, ValidationError } from '../../types';

interface ReportFormProps {
  reportData: ReportData;
  onReportDataChange: (data: ReportData) => void;
  onValidationError: (errors: ValidationError[]) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({
  reportData,
  onReportDataChange,
  onValidationError
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // File validation function
  const validateFiles = useCallback((files: File[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 10;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

    if (files.length > maxFiles) {
      errors.push({
        field: 'screenshots',
        message: `ファイル数が上限を超えています（最大${maxFiles}ファイル）`,
        type: 'size'
      });
    }

    files.forEach((file, index) => {
      // Add null check to prevent runtime errors
      if (!file) {
        errors.push({
          field: 'screenshots',
          message: `ファイル${index + 1}: 無効なファイルです`,
          type: 'type'
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push({
          field: 'screenshots',
          message: `ファイル${index + 1}: サポートされていない形式です（PNG, JPG, GIFのみ）`,
          type: 'type'
        });
      }

      if (file.size > maxFileSize) {
        errors.push({
          field: 'screenshots',
          message: `ファイル${index + 1}: ファイルサイズが大きすぎます（最大5MB）`,
          type: 'size'
        });
      }
    });

    return errors;
  }, []);

  // Comprehensive validation function
  const validateAllFields = useCallback((data: ReportData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Issue number validation
    if (!data.issueNumber.trim()) {
      errors.push({
        field: 'issueNumber',
        message: '課題番号は必須です',
        type: 'required'
      });
    } else if (!/^[A-Z]+-\d+$/.test(data.issueNumber.trim())) {
      errors.push({
        field: 'issueNumber',
        message: '課題番号の形式が正しくありません（例：PROJ-123）',
        type: 'format'
      });
    }
    
    // Category validation
    if (!data.category.trim()) {
      errors.push({
        field: 'category',
        message: 'カテゴリは必須です',
        type: 'required'
      });
    }
    
    // Related issues validation
    if (data.relatedIssues && data.relatedIssues.length > 0) {
      data.relatedIssues.forEach((issue, index) => {
        if (issue && !/^[A-Z]+-\d+$/.test(issue.trim())) {
          errors.push({
            field: 'relatedIssues',
            message: `関連課題${index + 1}の形式が正しくありません（例：PROJ-123）`,
            type: 'format'
          });
        }
      });
    }
    
    // File validation
    if (data.screenshots.length > 0) {
      const fileErrors = validateFiles(data.screenshots);
      errors.push(...fileErrors);
    }
    
    return errors;
  }, [validateFiles]);

  // Validation function for required fields only
  const validateRequiredFields = useCallback((data: ReportData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!data.issueNumber.trim()) {
      errors.push({
        field: 'issueNumber',
        message: '課題番号は必須です',
        type: 'required'
      });
    }
    
    if (!data.category.trim()) {
      errors.push({
        field: 'category',
        message: 'カテゴリは必須です',
        type: 'required'
      });
    }
    
    return errors;
  }, []);

  // Handle input changes with real-time validation
  const handleInputChange = useCallback((field: keyof ReportData, value: string | string[]) => {
    const updatedData = { ...reportData, [field]: value };
    onReportDataChange(updatedData);

    // Perform comprehensive validation
    const allErrors = validateAllFields(updatedData);
    
    setValidationErrors(allErrors);
    onValidationError(allErrors);
  }, [reportData, onReportDataChange, onValidationError, validateAllFields]);



  // Get validation summary
  const getValidationSummary = useCallback((): { hasErrors: boolean; errorCount: number; requiredFieldsComplete: boolean } => {
    const requiredErrors = validateRequiredFields(reportData);
    const allErrors = validateAllFields(reportData);
    
    return {
      hasErrors: allErrors.length > 0,
      errorCount: allErrors.length,
      requiredFieldsComplete: requiredErrors.length === 0
    };
  }, [reportData, validateRequiredFields, validateAllFields]);

  // Get error message for a specific field
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error?.message;
  }, [validationErrors]);

  // Remove file from screenshots
  const removeFile = useCallback((index: number) => {
    const updatedFiles = reportData.screenshots.filter((_, i) => i !== index);
    const updatedData = { ...reportData, screenshots: updatedFiles };
    onReportDataChange(updatedData);
  }, [reportData, onReportDataChange]);

  // Format file size for display
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Handle files from various sources (upload, drag & drop, paste)
  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    const totalFiles = reportData.screenshots.length + files.length;
    if (totalFiles > 10) {
      const allowedFiles = 10 - reportData.screenshots.length;
      if (allowedFiles <= 0) {
        const error: ValidationError = {
          field: 'screenshots',
          message: 'ファイル数が上限に達しています（最大10ファイル）',
          type: 'size'
        };
        const currentErrors = validationErrors.filter(err => err.field !== 'screenshots');
        const newErrors = [...currentErrors, error];
        setValidationErrors(newErrors);
        onValidationError(newErrors);
        return;
      }
      files = files.slice(0, allowedFiles);
    }

    // Validate files
    const fileErrors = validateFiles(files);
    
    if (fileErrors.length > 0) {
      const currentErrors = validationErrors.filter(err => err.field !== 'screenshots');
      const newErrors = [...currentErrors, ...fileErrors];
      setValidationErrors(newErrors);
      onValidationError(newErrors);
      return;
    }

    // Add files to existing screenshots
    const updatedFiles = [...reportData.screenshots, ...files];
    const updatedData = { ...reportData, screenshots: updatedFiles };
    onReportDataChange(updatedData);

    // Clear file-related errors
    const currentErrors = validationErrors.filter(err => err.field !== 'screenshots');
    setValidationErrors(currentErrors);
    onValidationError(currentErrors);
  }, [reportData, onReportDataChange, validateFiles, validationErrors, onValidationError]);

  // Handle file upload from input
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
    
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [handleFiles]);

  // Handle clipboard paste
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Create a more descriptive filename for pasted images
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const extension = file.type.split('/')[1] || 'png';
          const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
            type: file.type
          });
          files.push(newFile);
        }
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      handleFiles(files);
      setPasteHint(false);
    }
  }, [handleFiles]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Only set dragOver to false if we're leaving the upload area entirely
    if (!uploadAreaRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // Set up global paste event listener
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle paste if the form is visible and no input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT'
      );
      
      if (!isInputFocused) {
        handlePaste(event);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste]);

  // Show paste hint when Ctrl key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        setPasteHint(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        setPasteHint(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Priority options
  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' }
  ];

  // Category options (can be expanded based on project needs)
  const categoryOptions = [
    'デザインレビュー',
    'バグ報告',
    '機能改善',
    'パフォーマンス',
    'アクセシビリティ',
    'その他'
  ];

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        報告フォーム
      </h3>

      {/* Validation Summary */}
      {(() => {
        const summary = getValidationSummary();
        if (summary.hasErrors) {
          return (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    入力内容に問題があります
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {summary.errorCount}件のエラーがあります。以下の項目を確認してください。
                  </p>
                </div>
              </div>
            </div>
          );
        } else if (summary.requiredFieldsComplete) {
          return (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-800">
                    入力完了
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    必須項目の入力が完了しています。
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      <div className="space-y-6">
        {/* Issue Number Field */}
        <div>
          <label htmlFor="issueNumber" className="block text-sm font-medium text-gray-700 mb-2">
            課題番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="issueNumber"
            value={reportData.issueNumber}
            onChange={(e) => handleInputChange('issueNumber', e.target.value)}
            placeholder="例: PROJ-123"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('issueNumber') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('issueNumber') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('issueNumber')}</p>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            優先度
          </label>
          <select
            id="priority"
            value={reportData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={reportData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('category') ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">カテゴリを選択してください</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {getFieldError('category') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('category')}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            詳細説明
          </label>
          <textarea
            id="description"
            value={reportData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="課題の詳細や発生条件などを記入してください"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Screenshot Upload Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              スクリーンショット
            </label>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <span>💡 ヒント:</span>
              <span>スクリーンショットをコピーして</span>
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+V</kbd>
              <span>で貼り付け可能</span>
            </div>
          </div>
          <div className="space-y-4">
            {/* File Upload Area */}
            <div 
              ref={uploadAreaRef}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : pasteHint 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="screenshots"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="screenshots"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {isDragOver ? (
                  <>
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-600 font-medium">
                      ファイルをドロップしてアップロード
                    </span>
                  </>
                ) : pasteHint ? (
                  <>
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">
                      Ctrl+V でクリップボードから画像を貼り付け
                    </span>
                    <span className="text-xs text-green-500">
                      スクリーンショットをコピーしてから貼り付けてください
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      クリックしてファイルを選択、またはドラッグ&ドロップ
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF (最大5MB、10ファイルまで)
                    </span>
                    <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd>
                        <span>+</span>
                        <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">V</kbd>
                        <span>で貼り付け</span>
                      </span>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* File Upload Errors */}
            {getFieldError('screenshots') && (
              <p className="text-sm text-red-600">{getFieldError('screenshots')}</p>
            )}

            {/* File Preview Area */}
            {reportData.screenshots.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    アップロード済みファイル ({reportData.screenshots.length}/10)
                  </h4>
                  {reportData.screenshots.length >= 10 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      上限に達しました
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {reportData.screenshots.map((file, index) => {
                    // Check if file is a valid File object
                    if (!(file instanceof File)) {
                      console.warn('Invalid file object at index', index, file);
                      return null;
                    }
                    
                    return (
                      <div key={`${file.name}-${index}`} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                              // Clean up object URL to prevent memory leaks
                              const img = e.target as HTMLImageElement;
                              setTimeout(() => URL.revokeObjectURL(img.src), 1000);
                            }}
                            onError={(e) => {
                              console.error('Failed to load image:', file.name);
                              const img = e.target as HTMLImageElement;
                              URL.revokeObjectURL(img.src);
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                          onClick={() => removeFile(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
                          title="ファイルを削除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Issues Field */}
        <div>
          <label htmlFor="relatedIssues" className="block text-sm font-medium text-gray-700 mb-2">
            関連課題
          </label>
          <input
            type="text"
            id="relatedIssues"
            value={reportData.relatedIssues?.join(', ') || ''}
            onChange={(e) => {
              const issues = e.target.value
                .split(',')
                .map(issue => issue.trim())
                .filter(issue => issue.length > 0);
              handleInputChange('relatedIssues', issues);
            }}
            placeholder="例: PROJ-120, PROJ-121"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('relatedIssues') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('relatedIssues') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('relatedIssues')}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            複数の課題がある場合は、カンマで区切って入力してください
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;