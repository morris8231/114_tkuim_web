# PhotoMission 系統架構與流程圖

本文件包含 PhotoMission 攝影學習系統的完整架構圖和流程圖。

---

## 📐 系統架構圖

### 整體架構

```mermaid
graph TB
    subgraph "前端 Frontend"
        A[index.html<br/>主應用程式]
        B[admin.html<br/>管理員儀表板]
        C[app.js<br/>核心邏輯]
        D[eventBus.js<br/>事件系統]
        E[componentFactory.js<br/>元件工廠]
    end

    subgraph "後端 Backend - Express.js"
        F[server.js<br/>伺服器入口]
        G[Routes<br/>路由層]
        H[Services<br/>業務邏輯層]
        I[Repositories<br/>資料存取層]
        J[Middleware<br/>中介層]
    end

    subgraph "資料庫 Database"
        K[(MongoDB)]
        L[Users]
        M[Chapters]
        N[Tasks]
        O[Submissions]
        P[Analytics]
    end

    subgraph "外部服務 External"
        Q[Gmail SMTP<br/>郵件服務]
        R[File System<br/>檔案儲存]
    end

    A --> F
    B --> F
    C --> G
    F --> G
    G --> J
    J --> H
    H --> I
    I --> K
    K --> L
    K --> M
    K --> N
    K --> O
    K --> P
    H --> Q
    H --> R

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style F fill:#fff4e1
    style K fill:#e8f5e9
    style Q fill:#fce4ec
    style R fill:#fce4ec
```

---

## 🔐 用戶認證流程

### 註冊與 Email 驗證流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端
    participant API as Auth API
    participant DB as Database
    participant Email as Gmail SMTP

    U->>F: 填寫註冊表單
    F->>API: POST /api/auth/register
    API->>DB: 檢查 Email 是否存在
    
    alt Email 已存在
        DB-->>API: 用戶已存在
        API-->>F: 400 Error
        F-->>U: 顯示錯誤訊息
    else Email 可用
        API->>DB: 建立新用戶<br/>(isVerified: false)
        API->>API: 生成驗證 Token
        API->>Email: 發送驗證郵件
        Email-->>U: 📧 驗證郵件
        API-->>F: 註冊成功
        F-->>U: 顯示「請檢查郵件」
        
        U->>U: 點擊郵件中的連結
        U->>F: 訪問驗證 URL
        F->>API: GET /api/auth/verify/:token
        API->>DB: 驗證 Token 並更新用戶
        DB-->>API: 更新成功
        API-->>F: 驗證成功
        F-->>U: 顯示成功訊息<br/>2秒後跳轉首頁
    end
```

### 登入流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端
    participant API as Auth API
    participant DB as Database

    U->>F: 輸入帳號密碼
    F->>API: POST /api/auth/login
    API->>DB: 查詢用戶
    
    alt 用戶不存在
        DB-->>API: 找不到用戶
        API-->>F: 401 錯誤
        F-->>U: 顯示「帳號或密碼錯誤」
    else 密碼錯誤
        DB-->>API: 密碼不符
        API-->>F: 401 錯誤
        F-->>U: 顯示「帳號或密碼錯誤」
    else Email 未驗證
        DB-->>API: isVerified: false
        API-->>F: 403 Email 未驗證
        F-->>U: 顯示驗證提示<br/>提供重發驗證選項
    else 登入成功
        API->>DB: 更新 lastLogin
        API->>API: 生成 JWT Token
        API-->>F: 返回 Token
        F->>F: 儲存 Token 到 localStorage
        F->>API: GET /api/auth/me
        API->>DB: 取得用戶資料
        DB-->>API: 用戶資料
        API-->>F: 用戶資料
        F-->>U: 顯示主頁面
    end
```

---

## 📸 作品提交流程

```mermaid
flowchart TD
    Start([用戶開始提交作品]) --> Login{已登入?}
    Login -->|否| ShowLogin[顯示登入頁面]
    ShowLogin --> End([結束])
    
    Login -->|是| Verified{Email 已驗證?}
    Verified -->|否| ShowVerify[顯示驗證提示]
    ShowVerify --> End
    
    Verified -->|是| SelectTask[選擇任務]
    SelectTask --> UploadPhotos[上傳照片<br/>最多 5 張]
    UploadPhotos --> FillForm[填寫說明文字]
    FillForm --> Submit[提交表單]
    
    Submit --> API[POST /api/submissions]
    API --> CheckAuth{驗證 Token}
    CheckAuth -->|失敗| Error401[401 未授權]
    Error401 --> End
    
    CheckAuth -->|成功| CheckVerified{檢查驗證狀態}
    CheckVerified -->|未驗證| Error403[403 需要驗證]
    Error403 --> End
    
    CheckVerified -->|已驗證| SaveFiles[儲存照片到<br/>uploads/]
    SaveFiles --> SaveDB[儲存資料到<br/>MongoDB]
    SaveDB --> UpdateXP[更新用戶 XP]
    UpdateXP --> Success[返回成功訊息]
    Success --> Refresh[重新載入作品列表]
    Refresh --> End

    style Start fill:#e1f5ff
    style End fill:#e8f5e9
    style Error401 fill:#ffebee
    style Error403 fill:#ffebee
    style Success fill:#e8f5e9
```

---

## � 完整 CRUD 流程圖

### CREATE - 建立作品流程

上方的「作品提交流程」已涵蓋 CREATE 操作。

---

### READ - 查詢作品流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端
    participant API as Submissions API
    participant Repo as Repository
    participant DB as MongoDB

    U->>F: 訪問「我的作品」頁面
    F->>API: GET /api/submissions/my
    Note over F,API: Header: x-auth-token
    
    API->>API: 驗證 JWT Token
    
    alt Token 無效
        API-->>F: 401 未授權
        F-->>U: 跳轉登入頁
    else Token 有效
        API->>Repo: findSubmissionsByUserId(userId)
        Repo->>DB: db.submissions.find({ userId })
        DB-->>Repo: 作品列表
        Repo-->>API: 作品資料
        
        API->>API: Populate 關聯資料<br/>(task, user)
        API-->>F: 200 OK + JSON 資料
        F->>F: 渲染作品卡片
        F-->>U: 顯示作品列表
    end

    Note over U,DB: 資料流：前端 → API → Repository → MongoDB → 返回
```

---

### UPDATE - 更新作品流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端
    participant API as Submissions API
    participant Repo as Repository
    participant DB as MongoDB
    participant FS as File System

    U->>F: 點擊「✏️ 編輯」按鈕
    F->>F: 開啟編輯 Modal<br/>填入現有資料
    U->>F: 修改說明文字/照片
    U->>F: 點擊「儲存」
    
    F->>API: PUT /api/submissions/:id
    Note over F,API: FormData: description, photos<br/>Header: x-auth-token
    
    API->>API: 驗證 JWT Token
    
    alt Token 無效
        API-->>F: 401 未授權
        F-->>U: 顯示錯誤
    else Token 有效
        API->>Repo: findSubmissionById(id)
        Repo->>DB: db.submissions.findById(id)
        DB-->>Repo: 作品資料
        Repo-->>API: submission
        
        API->>API: 檢查擁有者<br/>submission.userId === req.user.id
        
        alt 非擁有者
            API-->>F: 403 權限不足
            F-->>U: 顯示「無權限編輯」
        else 是擁有者
            alt 有新照片
                API->>FS: 儲存新照片到 uploads/
                FS-->>API: 新照片路徑
                API->>FS: 刪除舊照片
            end
            
            API->>Repo: updateSubmission(id, updateData)
            Repo->>DB: db.submissions.findByIdAndUpdate(id, data)
            DB-->>Repo: 更新後的作品
            Repo-->>API: updated submission
            
            API-->>F: 200 OK + 更新後資料
            F->>F: 更新 UI 顯示
            F-->>U: 顯示「更新成功」
        end
    end

    Note over U,DB: 資料流：前端 → API → 驗證權限 → Repository → MongoDB → 返回
```

---

### DELETE - 刪除作品流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant F as 前端
    participant API as Submissions API
    participant Repo as Repository
    participant DB as MongoDB
    participant FS as File System

    U->>F: 點擊「🗑️ 刪除」按鈕
    F->>F: 顯示確認對話框
    U->>F: 確認刪除
    
    F->>API: DELETE /api/submissions/:id
    Note over F,API: Header: x-auth-token
    
    API->>API: 驗證 JWT Token
    
    alt Token 無效
        API-->>F: 401 未授權
        F-->>U: 顯示錯誤
    else Token 有效
        API->>Repo: findSubmissionById(id)
        Repo->>DB: db.submissions.findById(id)
        DB-->>Repo: 作品資料
        Repo-->>API: submission
        
        API->>API: 檢查擁有者<br/>submission.userId === req.user.id
        
        alt 非擁有者
            API-->>F: 403 權限不足
            F-->>U: 顯示「無權限刪除」
        else 是擁有者
            API->>FS: 刪除照片檔案<br/>unlink(photo paths)
            FS-->>API: 刪除成功
            
            API->>Repo: deleteSubmission(id)
            Repo->>DB: db.submissions.findByIdAndDelete(id)
            DB-->>Repo: 刪除成功
            Repo-->>API: { success: true }
            
            API-->>F: 200 OK
            F->>F: 從 UI 移除該作品卡片
            F-->>U: 顯示「刪除成功」
        end
    end

    Note over U,DB: 資料流：前端 → API → 驗證權限 → Repository → MongoDB + 檔案系統
```

---

### CRUD 流程總覽

```mermaid
flowchart TB
    User[用戶操作] --> Create[CREATE<br/>建立作品]
    User --> Read[READ<br/>查詢作品]
    User --> Update[UPDATE<br/>更新作品]
    User --> Delete[DELETE<br/>刪除作品]
    
    Create --> API1[POST /api/submissions]
    Read --> API2[GET /api/submissions/my]
    Update --> API3[PUT /api/submissions/:id]
    Delete --> API4[DELETE /api/submissions/:id]
    
    API1 --> Auth1{JWT 驗證}
    API2 --> Auth2{JWT 驗證}
    API3 --> Auth3{JWT 驗證}
    API4 --> Auth4{JWT 驗證}
    
    Auth1 --> Verify1{Email 驗證}
    Auth3 --> Owner1{擁有者檢查}
    Auth4 --> Owner2{擁有者檢查}
    
    Verify1 --> DB1[(MongoDB<br/>寫入)]
    Auth2 --> DB2[(MongoDB<br/>讀取)]
    Owner1 --> DB3[(MongoDB<br/>更新)]
    Owner2 --> DB4[(MongoDB<br/>刪除)]
    
    DB1 --> FS1[File System<br/>儲存照片]
    DB3 --> FS2[File System<br/>更新照片]
    DB4 --> FS3[File System<br/>刪除照片]
    
    FS1 --> Response1[返回成功]
    DB2 --> Response2[返回資料]
    FS2 --> Response3[返回成功]
    FS3 --> Response4[返回成功]
    
    Response1 --> UI1[更新 UI]
    Response2 --> UI2[顯示列表]
    Response3 --> UI3[更新卡片]
    Response4 --> UI4[移除卡片]
    
    style Create fill:#e8f5e9
    style Read fill:#e3f2fd
    style Update fill:#fff3e0
    style Delete fill:#ffebee
    style DB1 fill:#e8f5e9
    style DB2 fill:#e3f2fd
    style DB3 fill:#fff3e0
    style DB4 fill:#ffebee
```

---

## �🔧 管理員分析系統

### 點擊追蹤流程

```mermaid
sequenceDiagram
    participant U as 用戶
    participant Browser as 瀏覽器
    participant API as Analytics API
    participant DB as MongoDB

    U->>Browser: 點擊任何元素
    Browser->>Browser: 觸發 click 事件
    Browser->>API: POST /api/analytics/click
    
    par 非阻塞請求
        API->>DB: analytics.totalViews += 1
        DB-->>API: 更新成功
        API-->>Browser: 200 OK
    and 用戶繼續操作
        Browser->>U: 正常顯示頁面
    end

    Note over API,DB: 每次點擊即時更新<br/>不影響用戶體驗
```

### 管理員儀表板流程

```mermaid
flowchart TD
    Start([管理員訪問儀表板]) --> CheckToken{檢查 Token}
    CheckToken -->|無 Token| Redirect[跳轉到登入頁]
    Redirect --> End([結束])
    
    CheckToken -->|有 Token| LoadPage[載入 admin.html]
    LoadPage --> CallAPI[GET /api/admin/analytics]
    
    CallAPI --> AuthCheck{驗證權限}
    AuthCheck -->|非管理員| Error403[403 權限不足]
    Error403 --> ShowError[顯示錯誤訊息]
    ShowError --> End
    
    AuthCheck -->|是管理員| QueryDB[查詢資料庫]
    
    QueryDB --> GetViews[取得點擊次數<br/>Analytics.totalViews]
    QueryDB --> GetActive[計算活躍用戶<br/>30天內登入]
    QueryDB --> GetTotal[計算總用戶數]
    QueryDB --> GetVerified[計算已驗證用戶]
    
    GetViews --> Aggregate[彙總數據]
    GetActive --> Aggregate
    GetTotal --> Aggregate
    GetVerified --> Aggregate
    
    Aggregate --> ReturnJSON[返回 JSON 數據]
    ReturnJSON --> UpdateUI[更新儀表板 UI]
    UpdateUI --> AutoRefresh{30秒後}
    AutoRefresh --> CallAPI
    
    UpdateUI --> End

    style Start fill:#e1f5ff
    style End fill:#e8f5e9
    style Error403 fill:#ffebee
    style UpdateUI fill:#fff4e1
```

---

## 🗂️ 資料庫架構

### ER 圖 (Entity Relationship)

```mermaid
erDiagram
    USER ||--o{ SUBMISSION : creates
    USER {
        ObjectId _id PK
        string nickname
        string email UK
        string password
        string role
        boolean isVerified
        string verificationToken
        date verificationExpires
        date lastLogin
        date createdAt
        number xp
        number level
        array badges
        array completedTasks
    }

    CHAPTER ||--o{ TASK : contains
    CHAPTER {
        ObjectId _id PK
        string title
        string description
        number order
        boolean unlocked
        string youtubeLink
    }

    TASK ||--o{ SUBMISSION : "submitted for"
    TASK {
        ObjectId _id PK
        ObjectId chapterId FK
        string title
        string description
        number order
        number xpReward
        string difficulty
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId taskId FK
        array photos
        string description
        date submittedAt
        number month
        number year
    }

    ANALYTICS {
        ObjectId _id PK
        number totalViews
        date lastReset
        date lastUpdated
    }

    CONTACT {
        ObjectId _id PK
        string name
        string email
        string message
        date createdAt
    }
```

---

## 🔄 完整請求流程

### API 請求處理流程

```mermaid
flowchart LR
    Client[客戶端請求] --> Server[Express Server]
    Server --> Router[路由匹配]
    
    Router --> MW1{CORS<br/>Middleware}
    MW1 --> MW2{Body Parser}
    MW2 --> MW3{Page View<br/>Tracker}
    
    MW3 --> AuthRoute{需要認證?}
    AuthRoute -->|是| AuthMW[Auth<br/>Middleware]
    AuthRoute -->|否| Service[Service Layer]
    
    AuthMW --> VerifyJWT{驗證 JWT}
    VerifyJWT -->|失敗| Err401[401 未授權]
    VerifyJWT -->|成功| AdminRoute{需要管理員?}
    
    AdminRoute -->|是| AdminMW[Admin<br/>Middleware]
    AdminRoute -->|否| VerifiedRoute{需要驗證?}
    
    AdminMW --> CheckRole{檢查角色}
    CheckRole -->|非管理員| Err403[403 權限不足]
    CheckRole -->|是管理員| Service
    
    VerifiedRoute -->|是| VerifiedMW[Verified<br/>Middleware]
    VerifiedRoute -->|否| Service
    
    VerifiedMW --> CheckVerified{檢查驗證}
    CheckVerified -->|未驗證| Err403V[403 需要驗證]
    CheckVerified -->|已驗證| Service
    
    Service --> Repo[Repository Layer]
    Repo --> DB[(MongoDB)]
    DB --> Repo
    Repo --> Service
    Service --> Response[返回響應]
    
    Err401 --> Response
    Err403 --> Response
    Err403V --> Response
    Response --> Client

    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style DB fill:#e8f5e9
    style Err401 fill:#ffebee
    style Err403 fill:#ffebee
    style Err403V fill:#ffebee
```

---

## 📱 前端狀態管理

```mermaid
stateDiagram-v2
    [*] --> 初始化
    初始化 --> 檢查Token
    
    檢查Token --> 未登入: 無 Token
    檢查Token --> 已登入: 有 Token
    
    未登入 --> 顯示登入頁
    顯示登入頁 --> 已登入: 登入成功
    
    已登入 --> 載入用戶資料
    載入用戶資料 --> 顯示主頁面
    
    顯示主頁面 --> 學習章節: 點擊導航
    顯示主頁面 --> 我的作品: 點擊導航
    顯示主頁面 --> 每月回顧: 點擊導航
    顯示主頁面 --> 管理員儀表板: 管理員點擊
    
    學習章節 --> 任務列表: 選擇章節
    任務列表 --> 提交作品: 選擇任務
    提交作品 --> 我的作品: 提交成功
    
    我的作品 --> 編輯作品: 點擊編輯
    我的作品 --> 刪除作品: 點擊刪除
    編輯作品 --> 我的作品: 更新成功
    刪除作品 --> 我的作品: 刪除成功
    
    管理員儀表板 --> 顯示主頁面: 返回
    
    已登入 --> 未登入: 登出
```

---

## 🎯 關鍵功能流程總結

### 1. 用戶註冊驗證
1. 用戶填寫註冊表單
2. 系統建立帳號（未驗證狀態）
3. 發送驗證郵件
4. 用戶點擊郵件連結
5. 系統驗證 Token 並啟用帳號
6. 自動跳轉到登入頁

### 2. 作品提交
1. 檢查登入狀態
2. 檢查 Email 驗證狀態
3. 選擇任務
4. 上傳照片（最多 5 張）
5. 填寫說明
6. 提交到後端
7. 儲存檔案和資料
8. 更新用戶 XP
9. 重新載入作品列表

### 3. 管理員分析
1. 前端監聽所有點擊事件
2. 發送點擊事件到 API
3. 後端即時更新計數器
4. 管理員訪問儀表板
5. 驗證管理員權限
6. 查詢並彙總數據
7. 返回 JSON 給前端
8. 更新 UI 顯示
9. 每 30 秒自動刷新

---

**圖表說明**：
- 🔵 藍色：前端/客戶端
- 🟡 黃色：後端/伺服器
- 🟢 綠色：資料庫/成功
- 🔴 紅色：錯誤/失敗
