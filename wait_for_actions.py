#!/usr/bin/env python3
"""
GitHub Actions 完了待機ツール
使用方法: python3 wait_for_actions.py
"""

import subprocess
import json
import time
import sys
from datetime import datetime, timedelta
import signal

class GitHubActionsWatcher:
    def __init__(self, check_interval=30, max_wait_minutes=30):
        self.check_interval = check_interval
        self.max_wait_time = max_wait_minutes * 60
        self.start_time = time.time()
        self.wait_count = 0
        
    def run_gh_command(self, cmd):
        """GitHub CLI コマンドを実行"""
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print(f"❌ コマンド実行エラー: {e}")
            return None
            
    def get_latest_run(self):
        """最新のワークフロー実行情報を取得"""
        cmd = "gh run list --limit 1 --json databaseId,status,conclusion,displayTitle,createdAt,htmlUrl"
        output = self.run_gh_command(cmd)
        if not output:
            return None
            
        try:
            data = json.loads(output)
            return data[0] if data else None
        except json.JSONDecodeError:
            print("❌ JSON解析エラー")
            return None
            
    def format_time(self, seconds):
        """秒を MM:SS 形式でフォーマット"""
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes:02d}:{secs:02d}"
        
    def print_run_info(self, run_data):
        """実行情報を表示"""
        print("📋 監視対象:")
        print(f"   🆔 Run ID: {run_data['databaseId']}")
        print(f"   📝 Title: {run_data['displayTitle']}")
        print(f"   📅 Created: {run_data['createdAt']}")
        print(f"   🔗 URL: {run_data['htmlUrl']}")
        print(f"   📊 Status: {run_data['status']}")
        if run_data.get('conclusion'):
            print(f"   🏁 Conclusion: {run_data['conclusion']}")
            
    def get_job_summary(self, run_id):
        """ジョブサマリーを取得"""
        cmd = f"gh run view {run_id} --json jobs"
        output = self.run_gh_command(cmd)
        if not output:
            return []
            
        try:
            data = json.loads(output)
            return data.get('jobs', [])
        except json.JSONDecodeError:
            return []
            
    def handle_success(self, run_data):
        """成功時の処理"""
        print("🎉 結果: SUCCESS")
        print("✅ すべてのチェックが成功しました！")
        
        jobs = self.get_job_summary(run_data['databaseId'])
        if jobs:
            print("\n📊 実行サマリー:")
            for job in jobs:
                status = job.get('conclusion', '実行中')
                print(f"  {job['name']}: {status}")
                
        return 0
        
    def handle_failure(self, run_data):
        """失敗時の処理"""
        print("💥 結果: FAILURE")
        print("❌ 1つ以上のチェックが失敗しました")
        
        jobs = self.get_job_summary(run_data['databaseId'])
        failed_jobs = [job for job in jobs if job.get('conclusion') == 'failure']
        
        if failed_jobs:
            print("\n📊 失敗したジョブ:")
            for job in failed_jobs:
                print(f"  ❌ {job['name']}")
                
        print(f"\n🔍 ログを確認するには:")
        print(f"   gh run view {run_data['databaseId']} --log")
        
        return 1
        
    def handle_cancelled(self, run_data):
        """キャンセル時の処理"""
        print("⚠️  結果: CANCELLED")
        print("ワークフローがキャンセルされました")
        return 2
        
    def check_prerequisites(self):
        """前提条件をチェック"""
        # GitHub CLI の存在確認
        if not self.run_gh_command("gh --version"):
            print("❌ GitHub CLI (gh) がインストールされていません")
            print("   インストール方法: https://cli.github.com/")
            return False
            
        # リポジトリの確認
        if not self.run_gh_command("gh repo view --json name"):
            print("❌ GitHubリポジトリが見つからないか、認証が必要です")
            print("   'gh auth login' を実行してください")
            return False
            
        return True
        
    def signal_handler(self, signum, frame):
        """Ctrl+C ハンドラー"""
        elapsed = time.time() - self.start_time
        print(f"\n\n⚠️  待機を中断しました (経過時間: {self.format_time(elapsed)})")
        sys.exit(130)
        
    def wait_for_completion(self):
        """メインの待機処理"""
        print("🚀 GitHub Actions 完了待機ツール開始")
        print(f"⏱️  チェック間隔: {self.check_interval}秒")
        print(f"⏰ 最大待機時間: {self.max_wait_time // 60}分")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
        # 前提条件チェック
        if not self.check_prerequisites():
            return 1
            
        # Ctrl+C ハンドラー設定
        signal.signal(signal.SIGINT, self.signal_handler)
        
        # 初回チェック
        print("🔍 最新のワークフロー実行を確認中...")
        initial_run = self.get_latest_run()
        if not initial_run:
            print("❌ ワークフロー実行が見つかりません")
            return 1
            
        self.print_run_info(initial_run)
        run_id = initial_run['databaseId']
        
        # 既に完了している場合の処理
        if initial_run['status'] == 'completed':
            print("")
            conclusion = initial_run.get('conclusion', 'unknown')
            if conclusion == 'success':
                return self.handle_success(initial_run)
            elif conclusion == 'failure':
                return self.handle_failure(initial_run)
            elif conclusion == 'cancelled':
                return self.handle_cancelled(initial_run)
            else:
                print(f"⚠️  不明な状態: {conclusion}")
                return 3
                
        print("\n⏳ ワークフローの完了を待機中...")
        print("   (Ctrl+C で中断できます)")
        
        # 待機ループ
        while True:
            elapsed = time.time() - self.start_time
            
            # 最大待機時間チェック
            if elapsed >= self.max_wait_time:
                print(f"\n⏰ 最大待機時間({self.max_wait_time // 60}分)に達しました")
                print("❌ タイムアウト")
                return 4
                
            # 待機
            time.sleep(self.check_interval)
            self.wait_count += 1
            
            # 進行状況表示
            print(f"\r⏱️  経過時間: {self.format_time(elapsed)} | チェック回数: {self.wait_count}回", end="", flush=True)
            
            # ステータスチェック
            current_run = self.get_latest_run()
            if not current_run:
                continue
                
            # 新しいワークフローが開始された場合
            if current_run['databaseId'] != run_id:
                print(f"\n🔄 新しいワークフローが検出されました")
                print(f"   新しいRun ID: {current_run['databaseId']}")
                print(f"   Title: {current_run['displayTitle']}")
                run_id = current_run['databaseId']
                
            # 完了チェック
            if current_run['status'] == 'completed':
                print(f"\n🎯 ワークフロー完了！")
                print(f"⏱️  総待機時間: {self.format_time(elapsed)}")
                print(f"🔗 URL: {current_run['htmlUrl']}")
                print("")
                
                conclusion = current_run.get('conclusion', 'unknown')
                if conclusion == 'success':
                    return self.handle_success(current_run)
                elif conclusion == 'failure':
                    return self.handle_failure(current_run)
                elif conclusion == 'cancelled':
                    return self.handle_cancelled(current_run)
                else:
                    print(f"❓ 結果: UNKNOWN ({conclusion})")
                    return 3

def main():
    watcher = GitHubActionsWatcher()
    return watcher.wait_for_completion()

if __name__ == "__main__":
    sys.exit(main())