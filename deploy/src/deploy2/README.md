# 統合診断アプリ(キャラクタービジュアル組み込み版)

このフォルダは、これまでの `shindan-app.zip` に**20体のキャラクタービジュアルを追加**したものです。
中身の差し替え箇所は `src/App.jsx` と、新しく増えた `public/characters/` フォルダの2つだけです。

## 追加された機能

- 診断結果画面に、**あなたのタイプのキャラクター画像**が表示されます
- 初回は「好きな方のビジュアルを選んでね」と2種類(スタイルA/B)から選べます。一度選ぶと、以後はそのスタイルで統一されます(端末に保存されます)
- 「ビジュアルを変更する」リンクでいつでも選び直せます

## 公開手順(いつもと同じ3ステップ)

1. GitHubのリポジトリを開く: `https://github.com/atsushigol11-lgtm/shindan-app`
2. `deploy` フォルダの中に、このフォルダの中身を**まるごと上書きアップロード**
   - 特に重要:`public/characters/` フォルダ(20枚の画像)を新規追加
   - `src/App.jsx` を上書き
3. 「Commit changes」→ Vercelが自動で再デプロイ(1〜2分)

## フォルダ構成

```
├── public/
│   └── characters/       ← 20体のキャラクター画像(新規)
│       ├── adventurer_m.webp / adventurer_f.webp  (冒険家)
│       ├── moodmaker_m.webp / moodmaker_f.webp     (ムードメーカー)
│       ├── leader_m.webp / leader_f.webp           (リーダー)
│       ├── sun_m.webp / sun_f.webp                 (太陽)
│       ├── artist_m.webp / artist_f.webp           (芸術家肌)
│       ├── scholar_m.webp / scholar_f.webp         (探求者)
│       ├── free_m.webp / free_f.webp               (自由人)
│       ├── guardian_m.webp / guardian_f.webp       (守護者)
│       ├── healer_m.webp / healer_f.webp           (癒し系)
│       └── craftsman_m.webp / craftsman_f.webp     (職人)
├── src/
│   ├── App.jsx           ← 更新済み(キャラ表示機能追加)
│   ├── main.jsx
│   └── lib/storage.js
├── api/claude.js
├── index.html
├── package.json
└── vite.config.js
```

## 今後の展開アイデア

- 骨格タイプ(ストレート/ウェーブ/ナチュラル)によって、キャラの体型を変える(今は性格タイプのみで出し分け)
- 相性診断・分身チャットの画面にもキャラを表示する
- マイページの履歴一覧に、過去のタイプのキャラを小さく並べる
