# 設計文書

## 概要

Backlog Assistは、Backlog初心者向けの課題報告支援Webアプリケーションです。React/TypeScriptベースのSPA（Single Page Application）として実装し、チェックリスト生成、フォーム入力、マークダウン生成の3つの主要機能を提供します。

## アーキテクチャ

### 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **状態管理**: React Context API + useReducer
- **スタイリング**: Tailwind CSS
- **ビルドツール**: Vite
- **ファイル処理**: File API（スクリーンショットアップロード用）
- **データ永続化**: LocalStorage（ルールセット保存用）

### アプリケーション構造

```
src/
├── components/           # 再利用可能なUIコンポーネント
│   ├── ChecklistGenerator/
│   ├── ReportForm/
│   └── MarkdownOutput/
├── contexts/            # React Context（状態管理）
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── data/               # 初期データ・ルールセット
└── App.tsx             # メインアプリケーション
```

## コンポーネントとインターフェース

### 1. ChecklistGenerator コンポーネント

**責務**: ルールセットからチェックリストを動的生成し、ユーザーの入力を管理

```typescript
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category?: string;
}

interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: ChecklistItem[];
}

interface ChecklistGeneratorProps {
  selectedRuleSet: RuleSet | null;
  onRuleSetChange: (ruleSet: RuleSet) => void;
  onChecklistUpdate: (checklist: ChecklistItem[]) => void;
}
```

### 2. ReportForm コンポーネント

**責務**: 課題番号、スクリーンショット、その他の報告情報を収集

```typescript
interface ReportData {
  issueNumber: string;
  screenshots: File[];
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  relatedIssues?: string[]; // 関連課題のキー（例: ["PROJ-120", "PROJ-121"]）
}

interface ReportFormProps {
  reportData: ReportData;
  onReportDataChange: (data: ReportData) => void;
  onValidationError: (errors: ValidationError[]) => void;
}
```

### 3. MarkdownOutput コンポーネント

**責務**: チェックリストとフォームデータからマークダウンを生成・表示

```typescript
interface MarkdownOutputProps {
  checklist: ChecklistItem[];
  reportData: ReportData;
  onCopyToClipboard: () => void;
}
```

### 4. アプリケーション状態管理

```typescript
interface AppState {
  selectedRuleSet: RuleSet | null;
  checklist: ChecklistItem[];
  reportData: ReportData;
  availableRuleSets: RuleSet[];
  generatedMarkdown: string;
}

type AppAction = 
  | { type: 'SET_RULE_SET'; payload: RuleSet }
  | { type: 'UPDATE_CHECKLIST'; payload: ChecklistItem[] }
  | { type: 'UPDATE_REPORT_DATA'; payload: ReportData }
  | { type: 'GENERATE_MARKDOWN' };
```

## データモデル

### ルールセット構造

```typescript
interface RuleSet {
  id: string;
  name: string;
  description: string;
  version: string;
  rules: Rule[];
  createdAt: Date;
  updatedAt: Date;
}

interface Rule {
  id: string;
  text: string;
  category: string;
  priority: number;
  description?: string;
}
```

### 初期ルールセット例（Figmaデザインルール）

```typescript
const figmaDesignRules: RuleSet = {
  id: 'figma-design-rules',
  name: 'Figmaデザインレビュールール',
  description: 'Figmaデザインファイルのレビュー用チェックリスト',
  version: '1.0.0',
  rules: [
    {
      id: 'design-consistency',
      text: 'デザインシステムのコンポーネントが正しく使用されているか',
      category: 'デザイン一貫性',
      priority: 1
    },
    {
      id: 'responsive-design',
      text: 'レスポンシブデザインが適切に設計されているか',
      category: 'レスポンシブ',
      priority: 2
    },
    {
      id: 'accessibility',
      text: 'アクセシビリティガイドラインに準拠しているか',
      category: 'アクセシビリティ',
      priority: 1
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## エラーハンドリング

### バリデーション戦略

1. **フォームバリデーション**
   - 課題番号形式の検証（正規表現）
   - 必須フィールドの検証
   - ファイルサイズ・形式の検証

2. **エラー表示**
   - インライン検証エラー
   - フォーム送信時の包括的エラー
   - ユーザーフレンドリーなエラーメッセージ

```typescript
interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'size' | 'type';
}

const validateReportData = (data: ReportData): ValidationError[] => {
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
```

## テスト戦略

### 単体テスト
- **コンポーネントテスト**: React Testing Library使用
- **ユーティリティ関数テスト**: Jest使用
- **バリデーション関数テスト**: 各種入力パターンの検証

### 統合テスト
- **ユーザーフロー**: チェックリスト生成→フォーム入力→マークダウン生成の一連の流れ
- **ファイルアップロード**: スクリーンショットアップロード機能
- **LocalStorage**: ルールセットの保存・読み込み

### テストケース例

```typescript
describe('ChecklistGenerator', () => {
  test('ルールセット選択時にチェックリストが生成される', () => {
    // テスト実装
  });
  
  test('チェックボックスの状態変更が正しく反映される', () => {
    // テスト実装
  });
});

describe('MarkdownGenerator', () => {
  test('チェックリストとフォームデータから正しいマークダウンが生成される', () => {
    // テスト実装
  });
  
  test('未チェック項目は生成されるマークダウンに含まれない', () => {
    // テスト実装
  });
});
```

## マークダウン生成仕様

### Backlog準拠のマークダウンルール

Backlog特有のマークダウン記法に準拠した出力を生成します：

- **チェックリスト**: `* [ ]` および `* [x]` 形式を使用
- **見出し**: `#` 記法を使用（最大6レベル）
- **太字**: `**テキスト**` 形式
- **リスト**: `*` を使用し、本文との間に空白行を挿入
- **コードブロック**: インラインコードは `` `コード` `` 形式
- **罫線**: `-----` を使用して区切り線を作成
- **課題リンク**: 課題キーを直接記述またはダブルブラケット `[[課題キー]]`

### 出力フォーマット

```markdown
# 課題レビュー報告

## 基本情報

* **課題番号**: PROJ-123
* **優先度**: 高
* **カテゴリ**: デザインレビュー
* **報告日時**: 2024-01-15 14:30

-----

## チェックリスト結果

### デザイン一貫性

* [x] デザインシステムのコンポーネントが正しく使用されているか
* [x] カラーパレットが統一されているか
* [ ] フォントサイズが適切に設定されているか

### レスポンシブ

* [x] レスポンシブデザインが適切に設計されているか
* [ ] タブレット表示の確認が完了しているか
* [x] モバイル表示での操作性が確保されているか

-----

## 添付ファイル

* screenshot1.png
* screenshot2.png
* design-mockup.fig

-----

## 詳細説明

[ユーザーが入力した説明文]

-----

## 関連課題

[[PROJ-120]] [[PROJ-121]]
```

### 生成ロジック

```typescript
interface MarkdownGenerator {
  generateBasicInfo(reportData: ReportData): string;
  generateChecklistResults(checklist: ChecklistItem[]): string;
  generateAttachments(screenshots: File[]): string;
  generateDescription(description: string): string;
  generateRelatedIssues(relatedIssues: string[]): string;
}

const generateMarkdown = (checklist: ChecklistItem[], reportData: ReportData): string => {
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
    generator.generateDescription(reportData.description),
    reportData.relatedIssues?.length ? generator.generateRelatedIssues(reportData.relatedIssues) : null
  ];
  
  return sections.filter(section => section !== null).join('\n');
};

class BacklogMarkdownGenerator implements MarkdownGenerator {
  generateBasicInfo(reportData: ReportData): string {
    const now = new Date().toLocaleString('ja-JP');
    return [
      '## 基本情報',
      '',
      `* **課題番号**: ${reportData.issueNumber}`,
      `* **優先度**: ${this.getPriorityLabel(reportData.priority)}`,
      `* **カテゴリ**: ${reportData.category}`,
      `* **報告日時**: ${now}`
    ].join('\n');
  }
  
  generateChecklistResults(checklist: ChecklistItem[]): string {
    const groupedItems = this.groupByCategory(checklist);
    const sections = Object.entries(groupedItems).map(([category, items]) => {
      const itemList = items.map(item => 
        `* [${item.checked ? 'x' : ' '}] ${item.text}`
      ).join('\n');
      
      return [
        `### ${category}`,
        '',
        itemList
      ].join('\n');
    });
    
    return ['## チェックリスト結果', '', ...sections].join('\n\n');
  }
  
  generateAttachments(screenshots: File[]): string {
    if (screenshots.length === 0) return '';
    
    const fileList = screenshots.map(file => `* ${file.name}`).join('\n');
    return ['## 添付ファイル', '', fileList].join('\n');
  }
  
  generateDescription(description: string): string {
    if (!description.trim()) return '';
    return ['## 詳細説明', '', description].join('\n');
  }
  
  generateRelatedIssues(relatedIssues: string[]): string {
    const issueLinks = relatedIssues.map(issue => `[[${issue}]]`).join(' ');
    return ['', '-----', '', '## 関連課題', '', issueLinks].join('\n');
  }
  
  private getPriorityLabel(priority: string): string {
    const labels = { low: '低', medium: '中', high: '高' };
    return labels[priority] || priority;
  }
  
  private groupByCategory(checklist: ChecklistItem[]): Record<string, ChecklistItem[]> {
    return checklist.reduce((groups, item) => {
      const category = item.category || 'その他';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {} as Record<string, ChecklistItem[]>);
  }
}
```

## 将来の拡張性

### Backlog API統合準備

```typescript
interface BacklogApiClient {
  authenticate(apiKey: string, baseUrl: string): Promise<void>;
  getIssue(issueKey: string): Promise<BacklogIssue>;
  addComment(issueKey: string, content: string): Promise<void>;
}

interface BacklogIssue {
  id: number;
  key: string;
  summary: string;
  description: string;
  status: BacklogStatus;
  assignee?: BacklogUser;
}
```

### 設定管理

```typescript
interface AppConfig {
  backlogApi?: {
    baseUrl: string;
    apiKey: string;
  };
  defaultRuleSet?: string;
  markdownTemplate?: string;
}
```