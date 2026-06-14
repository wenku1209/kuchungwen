# 網站流量追蹤

網站已預先支援 Google Analytics 4（GA4）。

## 啟用方式

1. 在 Google Analytics 建立 GA4 資源與「網站」資料串流。
2. 取得格式為 `G-XXXXXXXXXX` 的評估 ID。
3. 開啟 `index.html`，找到：

```html
<meta name="ga-measurement-id" content="" />
```

4. 將 ID 放入 `content`：

```html
<meta name="ga-measurement-id" content="G-XXXXXXXXXX" />
```

## 已追蹤事件

- `award_link_click`：紅點官方作品、科技新報報導
- `resume_download`：PDF 履歷下載
- `contact_click`：Email、電話
- `navigation_click`：主要導覽
- `cta_click`：首頁主要行動按鈕
- `language_switch`：中英文切換
- `brand_guide_click`：三份品牌規範 PDF

事件參數包含 `link_label`、`link_url`、`page_path` 與
`page_language`。未設定 GA4 ID 時不會向外傳送資料。
