#!/bin/bash

# GitHub Actions 完了待機ツール
# 使用方法: ./wait-for-actions.sh [オプション: リポジトリパス]

# 設定
REPO_PATH=${1:-"."}  # デフォルトは現在のディレクトリ
CHECK_INTERVAL=30    # 30秒間隔
MAX_WAIT_TIME=1800   # 最大30分待機
START_TIME=$(date +%s)

echo "🚀 GitHub Actions 完了待機ツール開始"
echo "📂 リポジトリ: $(basename "$(pwd)")"
echo "⏱️  チェック間隔: ${CHECK_INTERVAL}秒"
echo "⏰ 最大待機時間: $((MAX_WAIT_TIME / 60))分"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# GitHub CLI の存在確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "   インストール方法: https://cli.github.com/"
    exit 1
fi

# リポジトリの確認
if ! gh repo view &> /dev/null; then
    echo "❌ GitHubリポジトリが見つからないか、認証が必要です"
    echo "   'gh auth login' を実行してください"
    exit 1
fi

# 最新のワークフロー実行を取得
get_latest_run() {
    gh run list --limit 1 --json databaseId,status,conclusion,displayTitle,createdAt,htmlUrl | jq -r '.[0] | "\(.databaseId)|\(.status)|\(.conclusion // "null")|\(.displayTitle)|\(.createdAt)|\(.htmlUrl)"'
}

# 初回チェック
echo "🔍 最新のワークフロー実行を確認中..."
INITIAL_RUN=$(get_latest_run)
if [ -z "$INITIAL_RUN" ]; then
    echo "❌ ワークフロー実行が見つかりません"
    exit 1
fi

IFS='|' read -r RUN_ID STATUS CONCLUSION TITLE CREATED_AT URL <<< "$INITIAL_RUN"

echo "📋 監視対象:"
echo "   🆔 Run ID: $RUN_ID"
echo "   📝 Title: $TITLE"  
echo "   📅 Created: $CREATED_AT"
echo "   🔗 URL: $URL"
echo "   📊 Status: $STATUS"
if [ "$CONCLUSION" != "null" ]; then
    echo "   🏁 Conclusion: $CONCLUSION"
fi

# 既に完了している場合
if [ "$STATUS" = "completed" ]; then
    echo ""
    case "$CONCLUSION" in
        "success")
            echo "✅ ワークフローは既に成功しています！"
            exit 0
            ;;
        "failure")
            echo "❌ ワークフローは既に失敗しています"
            echo "🔗 詳細: $URL"
            exit 1
            ;;
        "cancelled")
            echo "⚠️  ワークフローはキャンセルされました"
            exit 2
            ;;
        *)
            echo "⚠️  不明な状態: $CONCLUSION"
            exit 3
            ;;
    esac
fi

echo ""
echo "⏳ ワークフローの完了を待機中..."
echo "   (Ctrl+C で中断できます)"

# 待機ループ
WAIT_COUNT=0
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    # 最大待機時間チェック
    if [ $ELAPSED -ge $MAX_WAIT_TIME ]; then
        echo ""
        echo "⏰ 最大待機時間($((MAX_WAIT_TIME / 60))分)に達しました"
        echo "❌ タイムアウト"
        exit 4
    fi
    
    # 30秒待機
    sleep $CHECK_INTERVAL
    WAIT_COUNT=$((WAIT_COUNT + 1))
    
    # 進行状況表示
    MINUTES=$((ELAPSED / 60))
    SECONDS=$((ELAPSED % 60))
    printf "\r⏱️  経過時間: %02d:%02d | チェック回数: %d回 " $MINUTES $SECONDS $WAIT_COUNT
    
    # ステータスチェック
    CURRENT_RUN=$(get_latest_run)
    IFS='|' read -r CURR_ID CURR_STATUS CURR_CONCLUSION CURR_TITLE CURR_CREATED CURR_URL <<< "$CURRENT_RUN"
    
    # 新しいワークフローが開始された場合
    if [ "$CURR_ID" != "$RUN_ID" ]; then
        echo ""
        echo "🔄 新しいワークフローが検出されました"
        echo "   新しいRun ID: $CURR_ID"
        echo "   Title: $CURR_TITLE"
        RUN_ID=$CURR_ID
        URL=$CURR_URL
    fi
    
    # 完了チェック
    if [ "$CURR_STATUS" = "completed" ]; then
        echo ""
        echo "🎯 ワークフロー完了！"
        
        FINAL_MINUTES=$((ELAPSED / 60))
        FINAL_SECONDS=$((ELAPSED % 60))
        echo "⏱️  総待機時間: $(printf "%02d:%02d" $FINAL_MINUTES $FINAL_SECONDS)"
        echo "🔗 URL: $URL"
        echo ""
        
        case "$CURR_CONCLUSION" in
            "success")
                echo "🎉 結果: SUCCESS"
                echo "✅ すべてのチェックが成功しました！"
                
                # 成功時の追加アクション例
                echo ""
                echo "📊 実行サマリー:"
                gh run view $RUN_ID --json jobs | jq -r '.jobs[] | "  \(.name): \(.conclusion // "実行中")"'
                
                exit 0
                ;;
            "failure")
                echo "💥 結果: FAILURE"
                echo "❌ 1つ以上のチェックが失敗しました"
                
                # 失敗時の詳細情報表示
                echo ""
                echo "📊 失敗したジョブ:"
                gh run view $RUN_ID --json jobs | jq -r '.jobs[] | select(.conclusion == "failure") | "  ❌ \(.name)"'
                
                echo ""
                echo "🔍 ログを確認するには:"
                echo "   gh run view $RUN_ID --log"
                
                exit 1
                ;;
            "cancelled")
                echo "⚠️  結果: CANCELLED"
                echo "ワークフローがキャンセルされました"
                exit 2
                ;;
            *)
                echo "❓ 結果: UNKNOWN ($CURR_CONCLUSION)"
                exit 3
                ;;
        esac
    fi
done