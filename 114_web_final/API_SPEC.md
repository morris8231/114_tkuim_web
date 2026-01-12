# PhotoMission API 規格文件

完整的 RESTful API 規格說明文件

**Base URL**: `http://localhost:3001/api`

**Version**: 1.0.0

---

## 📑 目錄

- [認證機制](#認證機制)
- [錯誤處理](#錯誤處理)
- [認證相關 API](#認證相關-api)
- [章節與任務 API](#章節與任務-api)
- [作品管理 API](#作品管理-api)
- [用戶資料 API](#用戶資料-api)
- [管理員 API](#管理員-api)
- [聯絡表單 API](#聯絡表單-api)

---

## 🔐 認證機制

### JWT Token 認證

大部分 API 需要在 Header 中提供 JWT Token：

```http
x-auth-token: <your-jwt-token>
```

### 權限等級

1. **Public** - 無需認證
2. **Private** - 需要登入（JWT Token）
3. **Verified** - 需要登入 + Email 已驗證
4. **Admin** - 需要登入 + 管理員權限

---

## ⚠️ 錯誤處理

### 標準錯誤格式

```json
{
  "msg": "錯誤訊息",
  "code": "ERROR_CODE" // 可選
}
```

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 201 | 建立成功 |
| 400 | 請求錯誤 |
| 401 | 未授權（未登入或 Token 無效） |
| 403 | 禁止訪問（權限不足） |
| 404 | 資源不存在 |
| 429 | 請求過於頻繁 |
| 500 | 伺服器錯誤 |

---

## 🔑 認證相關 API

### 1. 註冊新用戶

**POST** `/auth/register`

註冊新用戶並發送驗證郵件。

#### 請求

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "nickname": "小明",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"  // 可選，預設為 "user"
}
```

#### 響應 (200 OK)

```json
{
  "msg": "註冊成功！請檢查您的電子郵件以完成驗證。",
  "email": "user@example.com",
  "requiresVerification": true
}
```

#### 錯誤響應

```json
// 400 - Email 已存在
{
  "msg": "User already exists"
}

// 400 - 缺少必要欄位
{
  "msg": "Please provide all required fields"
}
```

---

### 2. 用戶登入

**POST** `/auth/login`

用戶登入並取得 JWT Token。

#### 請求

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 響應 (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nickname": "小明",
    "email": "user@example.com",
    "role": "user",
    "xp": 100,
    "level": 2
  }
}
```

#### 錯誤響應

```json
// 401 - 帳號或密碼錯誤
{
  "msg": "Invalid credentials"
}

// 403 - Email 未驗證
{
  "msg": "Email not verified"
}
```

---

### 3. Email 驗證

**GET** `/auth/verify/:token`

驗證用戶的 Email 地址。

#### 請求

```http
GET /api/auth/verify/abc123def456...
```

#### 響應 (200 OK)

```json
{
  "msg": "Email 驗證成功！",
  "email": "user@example.com"
}
```

#### 錯誤響應

```json
// 400 - Token 無效或過期
{
  "msg": "Invalid or expired verification token"
}
```

---

### 4. 重發驗證郵件

**POST** `/auth/resend-verification`

重新發送 Email 驗證郵件（5 分鐘冷卻時間）。

#### 請求

```http
POST /api/auth/resend-verification
Content-Type: application/json
```

```json
{
  "email": "user@example.com"
}
```

#### 響應 (200 OK)

```json
{
  "msg": "驗證郵件已重新發送"
}
```

#### 錯誤響應

```json
// 404 - 用戶不存在
{
  "msg": "User not found"
}

// 400 - Email 已驗證
{
  "msg": "Email already verified"
}

// 429 - 請求過於頻繁
{
  "msg": "Please wait before requesting another verification email"
}
```

---

### 5. 取得當前用戶資料

**GET** `/auth/me`

取得當前登入用戶的完整資料。

**權限**: Private

#### 請求

```http
GET /api/auth/me
x-auth-token: <your-jwt-token>
```

#### 響應 (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "nickname": "小明",
  "email": "user@example.com",
  "role": "user",
  "deviceType": "phone",
  "isVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-10T12:00:00.000Z",
  "xp": 150,
  "level": 3,
  "badges": ["初學者", "攝影新手"],
  "completedTasks": ["task_id_1", "task_id_2"]
}
```

---

## 📚 章節與任務 API

### 6. 取得所有章節

**GET** `/chapters`

取得所有攝影章節列表。

**權限**: Public

#### 請求

```http
GET /api/chapters
```

#### 響應 (200 OK)

```json
[
  {
    "id": "6964d3ee67b08c6e152e87de",
    "title": "主題 0：起步與設定",
    "description": "建立正確拍攝姿勢與穩定度...",
    "order": 0,
    "unlocked": true,
    "youtubeLink": ""
  },
  {
    "id": "6964d3ee67b08c6e152e87df",
    "title": "主題 1：曝光與清晰",
    "description": "掌握光線的進出，與畫面的清晰度",
    "order": 1,
    "unlocked": true,
    "youtubeLink": ""
  }
]
```

---

### 7. 取得單一章節

**GET** `/chapters/:id`

取得特定章節的詳細資訊。

**權限**: Public

#### 請求

```http
GET /api/chapters/6964d3ee67b08c6e152e87de
```

#### 響應 (200 OK)

```json
{
  "id": "6964d3ee67b08c6e152e87de",
  "title": "主題 0：起步與設定",
  "description": "建立正確拍攝姿勢與穩定度、理解鏡頭焦段觀念...",
  "order": 0,
  "unlocked": true,
  "youtubeLink": ""
}
```

---

### 8. 取得章節任務

**GET** `/chapters/:id/tasks`

取得特定章節的所有任務。

**權限**: Public

#### 請求

```http
GET /api/chapters/6964d3ee67b08c6e152e87de/tasks
```

#### 響應 (200 OK)

```json
[
  {
    "id": "task_id_1",
    "chapterId": "6964d3ee67b08c6e152e87de",
    "title": "任務 0-1：手持穩定練習",
    "description": "練習正確的手持相機姿勢...",
    "order": 1,
    "xpReward": 10,
    "difficulty": "beginner"
  },
  {
    "id": "task_id_2",
    "chapterId": "6964d3ee67b08c6e152e87de",
    "title": "任務 0-2：焦段認識",
    "description": "拍攝不同焦段的照片...",
    "order": 2,
    "xpReward": 15,
    "difficulty": "beginner"
  }
]
```

---

## 📸 作品管理 API

### 9. 提交作品

**POST** `/submissions`

提交新的攝影作品。

**權限**: Verified (需要登入且 Email 已驗證)

#### 請求

```http
POST /api/submissions
Content-Type: multipart/form-data
x-auth-token: <your-jwt-token>
```

**Form Data**:
- `taskId`: 任務 ID (required)
- `description`: 作品說明 (required)
- `photos`: 照片檔案，最多 5 張 (required)

#### 響應 (201 Created)

```json
{
  "msg": "作品提交成功",
  "submission": {
    "id": "submission_id_1",
    "userId": "507f1f77bcf86cd799439011",
    "taskId": "task_id_1",
    "photos": [
      "/uploads/1704067200000-photo1.jpg",
      "/uploads/1704067200001-photo2.jpg"
    ],
    "description": "這是我的第一次嘗試...",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "month": 1,
    "year": 2024
  },
  "xpGained": 10
}
```

#### 錯誤響應

```json
// 403 - Email 未驗證
{
  "msg": "請先驗證您的電子郵件",
  "code": "EMAIL_NOT_VERIFIED"
}

// 400 - 照片數量超過限制
{
  "msg": "最多只能上傳 5 張照片"
}
```

---

### 10. 取得所有作品

**GET** `/submissions`

取得所有公開作品（畫廊）。

**權限**: Public

#### 請求

```http
GET /api/submissions?limit=20&skip=0
```

**Query Parameters**:
- `limit`: 每頁數量 (預設: 20)
- `skip`: 跳過數量 (預設: 0)

#### 響應 (200 OK)

```json
[
  {
    "id": "submission_id_1",
    "user": {
      "id": "user_id_1",
      "nickname": "小明"
    },
    "task": {
      "id": "task_id_1",
      "title": "任務 0-1：手持穩定練習"
    },
    "photos": ["/uploads/photo1.jpg"],
    "description": "我的作品說明",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 11. 取得用戶作品

**GET** `/submissions/user/:userId`

取得特定用戶的所有作品。

**權限**: Public

#### 請求

```http
GET /api/submissions/user/507f1f77bcf86cd799439011
```

#### 響應 (200 OK)

```json
[
  {
    "id": "submission_id_1",
    "taskId": "task_id_1",
    "photos": ["/uploads/photo1.jpg"],
    "description": "我的作品",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "month": 1,
    "year": 2024
  }
]
```

---

### 12. 更新作品

**PUT** `/submissions/:id`

更新已提交的作品。

**權限**: Verified (只能更新自己的作品)

#### 請求

```http
PUT /api/submissions/submission_id_1
Content-Type: multipart/form-data
x-auth-token: <your-jwt-token>
```

**Form Data**:
- `description`: 新的作品說明 (optional)
- `photos`: 新的照片檔案 (optional)

#### 響應 (200 OK)

```json
{
  "msg": "作品更新成功",
  "submission": {
    "id": "submission_id_1",
    "description": "更新後的說明",
    "photos": ["/uploads/new-photo.jpg"]
  }
}
```

---

### 13. 刪除作品

**DELETE** `/submissions/:id`

刪除已提交的作品。

**權限**: Verified (只能刪除自己的作品)

#### 請求

```http
DELETE /api/submissions/submission_id_1
x-auth-token: <your-jwt-token>
```

#### 響應 (200 OK)

```json
{
  "msg": "作品刪除成功"
}
```

---

## 👤 用戶資料 API

### 14. 更新用戶資料

**PUT** `/user/profile`

更新當前用戶的個人資料。

**權限**: Private

#### 請求

```http
PUT /api/user/profile
Content-Type: application/json
x-auth-token: <your-jwt-token>
```

```json
{
  "nickname": "新暱稱",
  "deviceType": "camera"
}
```

#### 響應 (200 OK)

```json
{
  "msg": "資料更新成功",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nickname": "新暱稱",
    "deviceType": "camera"
  }
}
```

---

## 🔧 管理員 API

### 15. 取得分析數據

**GET** `/admin/analytics`

取得網站分析統計數據。

**權限**: Admin

#### 請求

```http
GET /api/admin/analytics
x-auth-token: <admin-jwt-token>
```

#### 響應 (200 OK)

```json
{
  "pageViews": 12345,
  "activeUsers": 42,
  "totalUsers": 100,
  "verifiedUsers": 85,
  "lastUpdated": "2024-01-10T12:00:00.000Z"
}
```

#### 錯誤響應

```json
// 403 - 非管理員
{
  "msg": "權限不足：僅限網站管理者訪問"
}
```

---

### 16. 記錄點擊事件

**POST** `/analytics/click`

記錄用戶點擊事件（用於統計）。

**權限**: Public

#### 請求

```http
POST /api/analytics/click
Content-Type: application/json
```

```json
{
  "target": "BUTTON",
  "timestamp": 1704067200000
}
```

#### 響應 (200 OK)

```
(空響應)
```

---

## 📧 聯絡表單 API

### 17. 提交聯絡表單

**POST** `/contact`

提交聯絡表單訊息。

**權限**: Public

#### 請求

```http
POST /api/contact
Content-Type: application/json
```

```json
{
  "name": "小明",
  "email": "user@example.com",
  "message": "我想詢問關於課程的問題..."
}
```

#### 響應 (200 OK)

```json
{
  "msg": "訊息已送出，我們會盡快回覆您"
}
```

---

## 📊 資料模型

### User (用戶)

```typescript
{
  _id: ObjectId,
  nickname: string,
  email: string,
  password: string (hashed),
  role: "user" | "admin",
  deviceType: "phone" | "camera",
  isVerified: boolean,
  verificationToken?: string,
  verificationExpires?: Date,
  lastLogin?: Date,
  createdAt: Date,
  xp: number,
  level: number,
  badges: string[],
  completedTasks: ObjectId[]
}
```

### Submission (作品)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  taskId: ObjectId,
  photos: string[],
  description: string,
  submittedAt: Date,
  month: number,
  year: number
}
```

---

## 🔄 使用範例

### JavaScript/Fetch 範例

```javascript
// 註冊
const register = async () => {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname: '小明',
      email: 'user@example.com',
      password: 'password123'
    })
  });
  const data = await res.json();
  console.log(data);
};

// 登入
const login = async () => {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  const data = await res.json();
  localStorage.setItem('token', data.token);
};

// 取得章節
const getChapters = async () => {
  const res = await fetch('http://localhost:3001/api/chapters');
  const chapters = await res.json();
  console.log(chapters);
};

// 提交作品
const submitWork = async (taskId, description, photos) => {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('description', description);
  photos.forEach(photo => formData.append('photos', photo));

  const res = await fetch('http://localhost:3001/api/submissions', {
    method: 'POST',
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    body: formData
  });
  const data = await res.json();
  console.log(data);
};
```

---

## 📝 注意事項

1. **Token 有效期**: JWT Token 預設有效期為 30 天
2. **檔案大小限制**: 單張照片最大 5MB
3. **照片數量限制**: 每次提交最多 5 張
4. **Rate Limiting**: 重發驗證郵件有 5 分鐘冷卻時間
5. **CORS**: 已啟用 CORS，允許跨域請求

---

**文件版本**: 1.0.0  
**最後更新**: 2026-01-12  
**作者**: 李同岳 & Antigravity Team
