import type { RuleSet } from '../types';

export const figmaDesignRules: RuleSet = {
  id: 'figma-design-rules',
  name: 'Figmaデザインレビュールール',
  description: 'Figmaデザインファイルのレビュー用チェックリスト',
  version: '1.0.0',
  rules: [
    {
      id: 'design-system-components',
      text: 'デザインシステムのコンポーネントが正しく使用されているか',
      category: 'デザイン一貫性',
      priority: 1,
      description: 'ボタン、フォーム、カードなどの標準コンポーネントが適切に使用されているかを確認'
    },
    {
      id: 'color-palette',
      text: 'カラーパレットが統一されているか',
      category: 'デザイン一貫性',
      priority: 1,
      description: 'ブランドカラーやテーマカラーが一貫して使用されているかを確認'
    },
    {
      id: 'font-sizes',
      text: 'フォントサイズが適切に設定されているか',
      category: 'デザイン一貫性',
      priority: 2,
      description: 'タイポグラフィスケールに従ったフォントサイズが使用されているかを確認'
    },
    {
      id: 'responsive-design',
      text: 'レスポンシブデザインが適切に設計されているか',
      category: 'レスポンシブ',
      priority: 1,
      description: 'デスクトップ、タブレット、モバイルでの表示が考慮されているかを確認'
    },
    {
      id: 'tablet-display',
      text: 'タブレット表示の確認が完了しているか',
      category: 'レスポンシブ',
      priority: 2,
      description: 'タブレットサイズでのレイアウトと操作性を確認'
    },
    {
      id: 'mobile-usability',
      text: 'モバイル表示での操作性が確保されているか',
      category: 'レスポンシブ',
      priority: 1,
      description: 'モバイルデバイスでのタッチ操作とユーザビリティを確認'
    },
    {
      id: 'accessibility-guidelines',
      text: 'アクセシビリティガイドラインに準拠しているか',
      category: 'アクセシビリティ',
      priority: 1,
      description: 'WCAG 2.1 AAレベルの基準に準拠しているかを確認'
    },
    {
      id: 'color-contrast',
      text: 'カラーコントラストが適切に設定されているか',
      category: 'アクセシビリティ',
      priority: 1,
      description: 'テキストと背景のコントラスト比が4.5:1以上であることを確認'
    },
    {
      id: 'focus-indicators',
      text: 'フォーカスインジケーターが適切に設計されているか',
      category: 'アクセシビリティ',
      priority: 2,
      description: 'キーボードナビゲーション時のフォーカス状態が明確に表示されるかを確認'
    },
    {
      id: 'spacing-consistency',
      text: 'スペーシングが一貫して適用されているか',
      category: 'レイアウト',
      priority: 2,
      description: 'マージンやパディングが8pxグリッドシステムに従って設定されているかを確認'
    },
    {
      id: 'component-states',
      text: 'コンポーネントの各状態が定義されているか',
      category: 'インタラクション',
      priority: 1,
      description: 'ホバー、アクティブ、ディセーブル状態などが適切に定義されているかを確認'
    },
    {
      id: 'loading-states',
      text: 'ローディング状態が適切に設計されているか',
      category: 'インタラクション',
      priority: 2,
      description: 'データ読み込み中やフォーム送信中の状態表示が設計されているかを確認'
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

// Additional rule sets for different types of reviews
export const codeReviewRules: RuleSet = {
  id: 'code-review-rules',
  name: 'コードレビュールール',
  description: 'プルリクエストやコードレビュー用チェックリスト',
  version: '1.0.0',
  rules: [
    {
      id: 'code-style',
      text: 'コーディングスタイルガイドに準拠しているか',
      category: 'コード品質',
      priority: 1,
      description: 'プロジェクトのコーディング規約に従っているかを確認'
    },
    {
      id: 'error-handling',
      text: '適切なエラーハンドリングが実装されているか',
      category: 'コード品質',
      priority: 1,
      description: 'try-catch文や例外処理が適切に実装されているかを確認'
    },
    {
      id: 'test-coverage',
      text: 'テストカバレッジが十分であるか',
      category: 'テスト',
      priority: 1,
      description: '新機能や変更に対するテストが適切に作成されているかを確認'
    },
    {
      id: 'performance',
      text: 'パフォーマンスへの影響が考慮されているか',
      category: 'パフォーマンス',
      priority: 2,
      description: 'メモリ使用量や処理速度への影響が検討されているかを確認'
    },
    {
      id: 'security',
      text: 'セキュリティ上の問題がないか',
      category: 'セキュリティ',
      priority: 1,
      description: 'SQLインジェクションやXSSなどの脆弱性がないかを確認'
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const uiTestRules: RuleSet = {
  id: 'ui-test-rules',
  name: 'UIテストルール',
  description: 'ユーザーインターフェースのテスト用チェックリスト',
  version: '1.0.0',
  rules: [
    {
      id: 'visual-consistency',
      text: '視覚的な一貫性が保たれているか',
      category: 'UI/UX',
      priority: 1,
      description: 'デザインシステムとの整合性が取れているかを確認'
    },
    {
      id: 'user-flow',
      text: 'ユーザーフローが直感的であるか',
      category: 'UI/UX',
      priority: 1,
      description: 'ユーザーが迷わずに操作できるかを確認'
    },
    {
      id: 'error-messages',
      text: 'エラーメッセージが分かりやすいか',
      category: 'ユーザビリティ',
      priority: 1,
      description: 'エラー発生時のメッセージが理解しやすいかを確認'
    },
    {
      id: 'loading-feedback',
      text: 'ローディング状態のフィードバックが適切か',
      category: 'ユーザビリティ',
      priority: 2,
      description: '処理中の状態表示が適切に行われているかを確認'
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

// Export all rule sets
export const allRuleSets: RuleSet[] = [
  figmaDesignRules,
  codeReviewRules,
  uiTestRules
];