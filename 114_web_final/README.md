# Photography Chapter-based Task Learning System (攝影章節式任務學習系統)

## Project Overview
This project is a web-based learning platform integrated with **Gamification** to help users verify photography skills.
Users complete tasks by taking photos, uploading them for review, earning XP, and leveling up.

### Core Features
1.  **Chapter-based Learning**: Structured path from "Exposure" to "Mastery".
2.  **Gamification**: Earn XP, Level Up, and unlock badges.
3.  **Community Gallery**: Share works and learn from others.
4.  **Full CRUD**: Create, Read, Update, and Delete submissions.

## Tech Stack
*   **Frontend**: Vanilla JavaScript (Component-based architecture), HTML5, CSS3
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Atlas or Local)
*   **Authentication**: JWT (JSON Web Tokens), bcryptjs
*   **Tools**: Git, VS Code

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd 114_web_final
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    PORT=3001
    MONGODB_URI=mongodb://localhost:27017/photo_learning
    JWT_SECRET=your_jwt_secret
    UPLOAD_DIR=uploads/
    ```

4.  **Run the Server**
    ```bash
    # Development Mode
    npm run dev
    ```

5.  **Access the App**
    Open [http://localhost:3001](http://localhost:3001) in your browser.

## System Architecture

### Frontend
*   `public/index.html`: Single Page Application (SPA) entry point.
*   `public/js/app.js`: Handles Routing, API calls, and State Management.
*   `public/css/style.css`: Responsive design.

### Backend
*   `server.js`: Entry point, Middleware setup.
*   `routes/auth.js`: Authentication endpoints.
*   `routes/api.js`: CRUD endpoints for Tasks and Submissions.
*   `models/`: Mongoose schemas (`User`, `Submission`).

## Design Patterns & Architecture

本專案採用多種設計模式來提升程式碼品質與可維護性：

### Backend Design Patterns
*   **Repository Pattern**: 封裝資料庫操作邏輯
*   **Service Pattern**: 集中業務邏輯處理
*   **Singleton Pattern**: 確保資源單一實例（DB 連線、Logger）

### Frontend Design Patterns
*   **Observer Pattern**: 實作事件中心，處理狀態變化的 UI 更新
*   **Factory Pattern**: 動態產生不同類型的任務卡與圖表元件

### Authentication & Authorization
*   JWT Token 認證機制
*   bcrypt 密碼加密
*   Role-based 權限控管（user / admin）

詳細設計模式應用與 API 規格請參考：[DESIGN_SPEC.md](DESIGN_SPEC.md)

## CRUD Operations Flow

*   **Create**: User captures photo -> Fills form -> Frontend sends `POST /api/submissions` -> Backend saves to MongoDB & updates XP.
*   **Read**: User views Gallery -> Frontend calls `GET /api/submissions` -> Backend queries MongoDB -> UI Renders cards.
*   **Update**: User clicks "Edit" -> Frontend calls `PUT /api/submissions/:id` -> Backend updates text -> UI Refreshes.
*   **Delete**: User clicks "Delete" -> Frontend calls `DELETE /api/submissions/:id` -> Backend removes doc -> UI Refreshes.

## API Specification
See [docs/api-spec.md](docs/api-spec.md) for full details.

## License
MIT

---

## 課程筆記 (Course Notes)

### 0916
- 完成Github 倉庫建立
- 嘗試git clone 專案
- 嘗試推送檔案
- 加入test.html
