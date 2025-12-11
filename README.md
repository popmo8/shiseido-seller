# 資生堂 SHISEIDO - AI 美妝顧問

## 📦 部署指南

### 使用 Vercel 部署（推薦）

#### 1. 準備工作
確保您已經有：
- GitHub 帳號
- Vercel 帳號（可使用 GitHub 登入）
- Google Gemini API Key

#### 2. 推送到 GitHub
```bash
git add .
git commit -m "準備部署到 Vercel"
git push
```

#### 3. 部署到 Vercel

##### 方式一：使用 Vercel CLI（推薦）
```bash
# 安裝 Vercel CLI（如果還沒安裝）
npm install -g vercel

# 登入 Vercel
vercel login

# 部署
vercel

# 設定環境變數
vercel env add GEMINI_API_KEY

# 重新部署以套用環境變數
vercel --prod
```

##### 方式二：使用 Vercel 網頁介面
1. 前往 [Vercel](https://vercel.com)
2. 點擊 "Import Project"
3. 選擇您的 GitHub 倉庫
4. 在 "Environment Variables" 中新增：
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 您的 Google Gemini API Key
5. 點擊 "Deploy"

#### 4. 完成！
部署完成後，Vercel 會提供一個網址，例如：
```
https://your-project.vercel.app
```

## 🔒 安全性說明

### API Key 保護機制
- ✅ API Key 儲存在 Vercel 環境變數中，不會暴露在前端程式碼
- ✅ 前端透過 `/api/chat` 端點與後端通訊
- ✅ 後端代理 Google Gemini API 請求，保護您的 API Key
- ✅ `.env.local` 和 `.env` 已加入 `.gitignore`，不會被推送到 GitHub

### 檔案結構
```
shiseido-seller/
├── app.html              # 主應用程式（前端）
├── api/
│   └── chat.js          # Serverless Function（後端 API）
├── vercel.json          # Vercel 配置
├── .env.local           # 本地環境變數（不會被 git 追蹤）
├── .gitignore           # Git 忽略設定
└── README.md            # 本說明檔案
```

## 🧪 本地開發

如果您想在本地測試：

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 本地開發模式
vercel dev
```

然後開啟 `http://localhost:3000/app.html`

## ⚙️ 環境變數

在 Vercel 後台或使用 CLI 設定以下環境變數：

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `GEMINI_API_KEY` | Google Gemini API Key | ✅ |

## 🔄 更新部署

當您修改程式碼後：

```bash
git add .
git commit -m "更新說明"
git push
```

Vercel 會自動重新部署。

## 💡 常見問題

### Q: 為什麼不直接在前端使用 API Key？
A: 在前端直接使用 API Key 會被任何人看到（在瀏覽器的開發者工具中），這樣別人就可以盜用您的 API Key，導致額外費用。

### Q: 後端 API 會不會很貴？
A: Vercel 提供免費方案，對於小型專案完全足夠使用。

### Q: 如果想更換 API Key 怎麼辦？
A: 在 Vercel 後台的 Settings > Environment Variables 中更新 `GEMINI_API_KEY`，然後重新部署即可。

## 📝 授權
此專案僅供學習與展示使用。
