# 統合診断アプリ(デプロイ用・完成版)

このフォルダは、**そのままVercelで公開できる完全なプロジェクト**です。
package.json・ビルド設定・エントリーポイントまですべて含まれています。

## フォルダ構成

```
├── index.html          ← アプリの入り口
├── package.json        ← 使用パッケージとビルド設定(Vercelが自動で読み取ります)
├── vite.config.js      ← ビルドツールの設定
├── src/
│   ├── main.jsx        ← Reactの起動処理
│   ├── App.jsx         ← アプリ本体(診断・分身チャット・相性・プレミアム全部入り)
│   └── lib/storage.js  ← データ保存(localStorage)
├── api/
│   └── claude.js       ← AI呼び出しの中継(Vercelが自動でAPIにしてくれます)
├── phase2/             ← 【まだ使いません】Supabase・Stripe導入時に使うファイル一式
└── legal/              ← 【まだ使いません】課金開始前に整備する法的文書ドラフト
```

## 公開手順(やることは4つだけ)

1. **GitHubにこの中身をアップロード**
   リポジトリの「Add file → Upload files」画面に、このフォルダの中身を全部ドラッグ&ドロップ → 「Commit changes」

2. **AnthropicでAPIキーを発行**
   https://console.anthropic.com → API Keys → Create Key(表示されたキーを必ずコピー)

3. **VercelでImport+環境変数を1つ設定**
   https://vercel.com → Add New → Project → リポジトリを選択
   → Environment Variables に `ANTHROPIC_API_KEY` = (コピーしたキー) を追加

4. **Deployボタンを押す**
   数分で `https://〜.vercel.app` のURLが発行されます

## 動作確認

発行されたURLを開いて:
- 診断(25問)→ 結果が表示されるか
- 分身と話す → 返事が返ってくるか(ここでエラーが出る場合は環境変数の設定ミスが最有力)
- 相性診断 → コード共有リンクをコピーして、別のブラウザ/シークレットウィンドウで開けるか

エラーが出たら、メッセージをそのままClaudeに貼ってください。

## phase2フォルダについて

Supabase(クラウド保存)とStripe(実決済)の導入用ファイルです。
**今は触らなくてOK**です。このフォルダがあってもビルドには影響しません。
導入時期が来たら、Claudeに「phase2を組み込んで」と伝えてください。
