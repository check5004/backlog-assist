import type { RuleSet } from '../types';

export const figmaDesignRules: RuleSet = {
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