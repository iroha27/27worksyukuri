# ゆっくり27works 公式サイト

「ゆっくり27works」の会社・事業紹介サイトです。

## 技術スタック

- React 19 + Vite 6 + TypeScript
- Supabase(お問い合わせ保存・メール転送・YouTube RSS プロキシ)
- Verdent Hosting で公開(`.verdentc.json` がデプロイ契約)

## セットアップ

```bash
npm install
npm run dev             # 開発サーバー起動
npm run build           # Verdent 向け本番ビルド
npm run build:github    # GitHub Pages 向け本番ビルド
npm run preview         # Verdent ビルド成果物のプレビュー
```

## GitHub Pages で公開

- `main` ブランチ: ソースコード
- `gh-pages` ブランチ: ビルド済みの公開ファイル(`dist-github` の中身)

公開手順(初回のみ):

1. `npm run build:github` でビルド(base は `/27worksyukuri/`)
2. `dist-github` の中身を `gh-pages` ブランチとして push
3. リポジトリの **Settings → Pages** で Source: **Deploy from a branch** / Branch: **gh-pages** / Folder: **/ (root)** を選んで Save

更新手順: ソースを修正 → `npm run build:github` → `dist-github` の中身を `gh-pages` に commit & push(1〜2 分で自動反映)。公開 URL は `https://iroha27.github.io/27worksyukuri/` です。

GitHub Pages 用の Vite 設定は `vite.github.config.ts` に分けてあり、Verdent 向け設定(`vite.config.ts`)とは干渉しません。

お問い合わせや動画 API は既存の Supabase Edge Functions を利用します。サインインのリダイレクト先制限を使っている場合、GitHub Pages の公開 URL を Supabase/Verdent 側の許可 URL に追加してください。

## ページ構成

- トップ: ヒーロー / 事業内容 / 運営チャンネル / 最新の動画(YouTube RSS から自動取得)/ CTA
- 事業紹介: 事業概要 / 挨拶 / 沿革
- お問い合わせ: フォーム(Supabase 保存 + Resend によるメール転送)

## Supabase Edge Functions(`supabase/functions/`)

- `youtube-latest`: YouTube チャンネル RSS を取得して最新 3 本を返す(チャンネル ID は `YOUTUBE_CHANNEL_ID` 環境変数)
- `contact-notify`: お問い合わせ内容を Resend でメール転送(要 `RESEND_API_KEY` シークレット、転送先は `CONTACT_TO_EMAIL` 環境変数)

## 環境変数(公開ビルドでは自動注入)

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`(未設定時はコード内フォールバック値を使用)
- `VITE_VERDENT_OAUTH_INITIATE_URL`(Verdent サインイン用)

## 注意事項

- Supabase URL / publishable key は公開設定のためソースに含まれます。サーバー専用のシークレット(RESEND_API_KEY 等)はソースに含めないでください。
