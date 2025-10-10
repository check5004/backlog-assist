import { useBacklogIntegration } from '../../contexts/BacklogAuthContext';

interface BacklogStatusProps {
  compact?: boolean;
  onOpenSettings?: () => void;
}

export default function BacklogStatus({ compact = false, onOpenSettings }: BacklogStatusProps) {
  const { isAvailable, user, spaceName } = useBacklogIntegration();

  if (!isAvailable) {
    return compact ? (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-xs text-gray-500">Backlog未接続</span>
      </div>
    ) : (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Backlog API未接続</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              設定
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Backlog APIと連携すると、課題の詳細取得やコメント投稿が可能になります
        </p>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="mt-2 w-full px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Backlog連携を設定する
          </button>
        )}
      </div>
    );
  }

  return compact ? (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-xs text-green-600">
        {spaceName} ({user?.userId})
      </span>
    </div>
  ) : (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">Backlog API接続済み</span>
        </div>
        <span className="text-xs text-green-600">{spaceName}</span>
      </div>
      <div className="mt-2 text-sm text-green-700">
        <p>ユーザー: {user?.name} ({user?.userId})</p>
        {user?.mailAddress && (
          <p className="text-xs text-green-600">{user.mailAddress}</p>
        )}
      </div>
    </div>
  );
}