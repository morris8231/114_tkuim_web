# CRUD Mapping & Screen Flow

這份文件對應「攝影章節式任務學習系統」的畫面與後端 CRUD 操作。

## 1. 章節列表頁 (首頁) - `index.html`
**功能**：顯示所有章節，標示已解鎖/未解鎖狀態。
*   **API**: `GET /api/chapters`
*   **DB Operation**: `db.chapters.find({}).sort({ order: 1 })`
*   **Frontend Logic**:
    *   Fetch chapters.
    *   計算使用者當前進度（需要 `GET /api/users/me` 獲取已完成任務數）。
    *   Render Cards: 鎖定的章節顯示鎖頭 Icon，已解鎖的顯示進入按鈕。

## 2. 任務列表頁 - `chapter.html?id=xxx`
**功能**：顯示特定章節內的所有任務卡片。
*   **API**: `GET /api/tasks?chapterId=xxx`
*   **DB Operation**: `db.tasks.find({ chapterId: ObjectId(xxx) })`
*   **UI**: 顯示 Concept Card（觀念卡）與 Task Cards（任務卡）。

## 3. 任務詳情與提交頁 - `task.html?id=xxx`
**功能**：顯示任務指引，提供上傳表格。
*   **Read (任務詳情)**
    *   **API**: `GET /api/tasks/:id`
    *   **DB**: `db.tasks.findOne({ _id: ObjectId(xxx) })`
*   **Create (提交作品)**
    *   **API**: `POST /api/submissions`
    *   **Payload**: `FormData` (photos[], taskId, satisfaction ratings, reflection)
    *   **DB**: `db.submissions.insertOne({ ... })`
    *   **Logic**: 上傳成功後，更新使用者「已完成任務」狀態，檢查是否解鎖下一章。

## 4. 作品牆 (Gallery) - `gallery.html`
**功能**：展示所有提交的作品，支援篩選。
*   **API**: `GET /api/submissions`
*   **Query Params**: `?month=2023-10` 或 `?tag=composition`
*   **DB**: `db.submissions.find({ userId: current }).populate('taskId')`
*   **UI**: Grid layout 顯示照片，Hover 顯示評分與心得。

## 5. 每月回顧頁 - `review.html`
**功能**：顯示當月學習統計與成長報表。
*   **API**: `GET /api/reviews/:year/:month`
*   **Logic**:
    *   如果該月報表不存在，前端呼叫 `POST /api/reviews/:year/:month/generate` 觸發計算。
    *   **Aggregation (後端計算)**:
        *   Count total submissions in range.
        *   Calculate average ratings.
        *   Collect unique tags.
*   **DB**: `db.monthly_reviews.findOne(...)` OR Aggregate from `submissions`.

---

## 資料關聯 (Relationships)

*   **User** 1 : N **Submissions**
*   **Chapter** 1 : N **Tasks**
*   **Task** 1 : N **Submissions**
*   **Submission** contains **Photos** (Array of paths)
