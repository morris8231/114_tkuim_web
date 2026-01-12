# 📘 開發規格書：設計模式應用與登入權限管理

## 一、設計模式應用（Design Pattern Integration）

### 🔹 後端設計模式

| 模式名稱                   | 應用位置                                                    | 功能目的                                    | 實作方式                                                             |
| ---------------------- | ------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| **Repository Pattern** | `/repositories/UserRepository.js`、`TaskRepository.js` 等 | 封裝 MongoDB 資料存取邏輯，讓 Service 不需接觸資料庫操作細節 | 提供如 `findUserByEmail`、`createSubmission` 等方法，內部用 Mongoose 操作資料模型 |
| **Service Pattern**    | `/services/AuthService.js`、`ProgressService.js`         | 集中處理業務邏輯（例如：註冊驗證、完成任務後解鎖章節）             | Controller 呼叫 Service 方法，Service 再透過 Repository 完成操作，保持模組責任清晰    |
| **Singleton Pattern**  | `/config/db.js`、`/utils/logger.js`                      | 確保 MongoDB 連線、設定與共用物件只初始化一次             | 使用 module cache 或自建 Singleton 類別包裝共用資源（如 Mongoose 連線）            |

---

### 🔸 前端設計模式

| 模式名稱                 | 應用場景                            | 功能目的                       | 實作方式                                                                |
| -------------------- | ------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| **Observer Pattern** | 任務完成後 → 進度條、章節解鎖同步變更            | 讓 UI 根據狀態變化自動更新，而非手動刷新全部頁面 | 實作全域事件中心（eventBus），任務完成時發出 `progressUpdated` 事件，進度條與章節卡元件訂閱該事件並更新畫面 |
| **Factory Pattern**  | 任務卡元件生成（拍照任務、選擇題任務）<br>統計圖表元件生成 | 根據任務型別或報表需求動態產生對應元件        | 使用 `createComponent(type)` 函式回傳元件結構或 HTML Template，統一管理產生流程         |

---

## 二、登入與權限管理（Authentication & Authorization）

### 🔐 功能需求

| 功能          | 說明                                                 |
| ----------- | -------------------------------------------------- |
| 使用者註冊       | 輸入 email + 密碼，使用 bcrypt 加密後儲存                      |
| 使用者登入       | 輸入 email + 密碼 → 核對後發 JWT Token                     |
| Token 驗證中介層 | 保護 `/api/submissions`, `/api/users/me` 等需登入權限的 API |
| 角色權限控管      | 未來可區分 admin / user，部分 API（如新增章節）限制 admin 存取        |

### 📦 已用套件（在 `package.json` 中）

* `bcryptjs`：密碼加密與驗證
* `jsonwebtoken`：簽發與解析 JWT Token
* `dotenv`：環境變數儲存密鑰
* `express` + `express.Router()`：API 路由控制
* `mongoose`：資料模型與驗證

### 🧱 資料模型設計（User Schema 範例）

```js
{
  email: String,
  passwordHash: String,
  nickname: String,
  role: { type: String, default: 'user' }, // 可擴充 admin / reviewer
  completedTasks: [taskId]
}
```

### 🧩 API 規格（取自 CRUD_MAPPING 與 routes 設計）

| API                         | 方法   | 權限保護  | 描述          |
| --------------------------- | ---- | ----- | ----------- |
| `/api/auth/register`        | POST | ❌     | 註冊帳號        |
| `/api/auth/login`           | POST | ❌     | 登入並獲得 JWT   |
| `/api/users/me`             | GET  | ✅ JWT | 取得個人資料與進度   |
| `/api/submissions`          | POST | ✅ JWT | 提交任務作品（含圖片） |
| `/api/reviews/:year/:month` | GET  | ✅ JWT | 每月成長報表資料    |

---

## 三、Figma 介面設計稿（說明）

雖然目前尚未提供實際 Figma 檔案，但根據 CRUD 與頁面流程文件，前端頁面設計應包含以下畫面與元件：

1. **首頁章節列表 index.html**

   * 每章顯示進度與鎖頭（未解鎖）
   * 任務總覽卡片、進度條

2. **章節任務列表 chapter.html**

   * 顯示任務卡，點擊可進入詳情
   * 導覽與回上頁 UI

3. **任務詳情與提交頁 task.html**

   * 上傳圖片、填寫評分與心得
   * 提交成功跳出提示（可用 SweetAlert）

4. **作品牆 gallery.html**

   * 顯示所有照片縮圖，可點開放大
   * 篩選器（時間 / 題材）

5. **每月回顧 review.html**

   * 使用 Chart.js 呈現統計圖
   * 顯示本月學習量、任務數與代表作品

---

## 四、實作指南

### 後端實作重點

1. **Repository 層**
   - 封裝所有資料庫操作
   - 提供乾淨的 API 給 Service 層使用
   - 處理 Mongoose 查詢與錯誤

2. **Service 層**
   - 實作業務邏輯
   - 驗證資料完整性
   - 處理跨 Repository 的操作

3. **Middleware**
   - JWT 驗證中介層
   - 檔案上傳處理
   - 錯誤處理

### 前端實作重點

1. **Event Bus**
   - 實作全域事件系統
   - 解耦元件間通訊
   - 支援任務完成、進度更新等事件

2. **Component Factory**
   - 動態產生任務卡元件
   - 支援不同任務類型
   - 統一元件生成介面

3. **狀態管理**
   - 使用者登入狀態
   - 任務完成進度
   - 章節解鎖狀態
