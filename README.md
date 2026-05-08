# Hakumei GreenField

Astroで構築した静的ブログのv0骨格です。

## コンテンツ配置ルール

`content/` 配下を「薄明共通フォーマット (1成果物 = 1フォルダ)」へ統一しました。

- 各成果物フォルダに `manifest.json` を置く
- 本文 (`article.md` / `episode.md`) またはエントリ (`index.html`) を置く
- 画像・静的ファイルは `assets/` にまとめる

詳細は `content/README.md` と `content/templates/` を参照してください。

## 起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

Cloudflare Pagesでは、ビルドコマンドに `npm run build`、出力ディレクトリに `dist` を指定してください。
