# Hakumei Content Package 構成 (v0)

このディレクトリは「1成果物 = 1フォルダ」の共通フォーマットに従って管理します。

## 共通原則

- 制作方法は自由。
- 納入形式は統一。
- 公開サイトは `manifest.json` を正本として扱う。

## ルート構成

```text
content/
  h-article/
  s-article/
  tools/
  games/
  hakoniwa/
    diary/
    management-log/
  novel/
```

## 成果物フォルダの基本形

```text
<package-slug>/
  manifest.json
  article.md or episode.md or index.html
  assets/
```

## manifest 必須項目 (v0)

- `schema_version`
- `type`
- `slug`
- `title`
- `summary`
- `status`
- `created_at`
- `updated_at`
- `language`
- `content` または `entry`
- `assets_dir`

## カテゴリ別の基準

- `h-article` / `s-article` / `hakoniwa`: `article.md` + `assets/` + `manifest.json`
- `tools` / `games`: `index.html` + `assets/` + `manifest.json`
- `novel`: シリーズ `manifest.json` + `episodes/<episode>/` 配下に各話 `manifest.json` と `episode.md`

詳細テンプレートは `content/templates/` を参照してください。
