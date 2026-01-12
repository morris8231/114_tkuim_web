// ComponentFactory - Factory Pattern Implementation
// 動態產生不同類型的 UI 元件

const ComponentFactory = {
    /**
     * 創建章節卡片
     * @param {Object} chapterData - 章節資料
     * @returns {string} HTML 字串
     */
    createChapterCard(chapterData) {
        const locked = !chapterData.unlocked;
        const onClick = locked ? '' : `app.loadTasks('${chapterData.id}')`;

        return `
      <div class="card ${locked ? 'locked' : ''}" onclick="${onClick}">
        <div class="card-header">
          <span class="chapter-number">CHAPTER ${chapterData.id}</span>
          ${chapterData.unlocked ? '🔓' : '🔒'}
        </div>
        <h3 class="card-title">${chapterData.title}</h3>
        <p class="card-desc">${chapterData.description || '完成前置條件以解鎖此章節'}</p>
        ${chapterData.youtubeLink ? `
          <div class="card-actions" style="margin-top: 10px;">
            <a href="${chapterData.youtubeLink}" target="_blank" onclick="event.stopPropagation();" 
               class="btn-youtube" style="display: inline-block; padding: 5px 10px; background: #ff0000; 
               color: white; text-decoration: none; border-radius: 4px; font-size: 0.8em;">
              ▶ Watch Tutorial
            </a>
          </div>
        ` : ''}
      </div>
    `;
    },

    /**
     * 創建任務卡片
     * @param {Object} taskData - 任務資料
     * @returns {string} HTML 字串
     */
    createTaskCard(taskData) {
        return `
      <div class="card" onclick="app.openTaskDetail('${taskData.id}')">
        <div class="card-header">
          <span class="chapter-number">TASK ${taskData.order}</span>
          <span class="badge">Diff: ${taskData.difficulty}</span>
        </div>
        <h3 class="card-title">${taskData.title}</h3>
        <p class="card-desc">${taskData.concept}</p>
        <div style="margin-top: 10px; font-size: 0.8em; color: #888;">
          ⏱ ${taskData.duration} min
        </div>
      </div>
    `;
    },

    /**
     * 創建作品牆項目
     * @param {Object} submissionData - 作品資料
     * @param {string} currentUserId - 當前使用者 ID
     * @returns {string} HTML 字串
     */
    createGalleryItem(submissionData, currentUserId = null) {
        const imgSrc = submissionData.photos && submissionData.photos.length > 0
            ? submissionData.photos[0]
            : '';
        const dateStr = new Date(submissionData.createdAt).toLocaleDateString();
        const isOwner = currentUserId && currentUserId === submissionData.userId;

        return `
      <div class="gallery-item" id="submission-${submissionData._id}">
        <div style="height: 200px; background: #eee; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          ${imgSrc ? `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="作品">` : '無圖片'}
        </div>
        <div class="gallery-info">
          <p><strong>提交時間:</strong> ${dateStr}</p>
          <p><span id="reflection-${submissionData._id}">${submissionData.reflection ? `心得: ${submissionData.reflection}` : ''}</span></p>
          <div class="gallery-actions">
            <button class="like-btn" onclick="app.toggleLike('${submissionData._id}', this)">
              ❤️ <span class="like-count">${submissionData.likes || 0}</span>
            </button>
            ${isOwner ? `
              <button class="btn-sm" onclick="app.openEditModal('${submissionData._id}', '${submissionData.reflection || ''}')">✏️</button>
              <button class="btn-sm" style="color:red;" onclick="app.deleteSubmission('${submissionData._id}')">🗑️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    },

    /**
     * 創建統計卡片
     * @param {Object} statsData - 統計資料
     * @returns {string} HTML 字串
     */
    createStatsCard(statsData) {
        const { title, value, change, icon } = statsData;
        const changeClass = change >= 0 ? 'positive' : 'negative';

        return `
      <div class="stats-card">
        <div class="stats-icon">${icon}</div>
        <div class="stats-content">
          <h4>${title}</h4>
          <div class="stats-value">${value}</div>
          ${change !== undefined ? `
            <div class="stats-change ${changeClass}">
              ${change >= 0 ? '+' : ''}${change}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    },

    /**
     * 創建進度條
     * @param {Object} progressData - 進度資料
     * @returns {string} HTML 字串
     */
    createProgressBar(progressData) {
        const { label, current, total, percentage } = progressData;
        const pct = percentage || (current / total * 100);

        return `
      <div class="progress-bar-container">
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${pct}%">
            <span class="progress-text">${current} / ${total}</span>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * 創建活動記錄項目
     * @param {Object} activityData - 活動資料
     * @returns {string} HTML 字串
     */
    createActivityItem(activityData) {
        const { date, description } = activityData;
        const dateStr = typeof date === 'string' ? date : new Date(date).toLocaleDateString();

        return `
      <li>
        <span class="activity-date">${dateStr}</span>
        <span class="activity-desc">${description}</span>
      </li>
    `;
    },

    /**
     * 批量創建元件
     * @param {string} type - 元件類型
     * @param {Array} dataArray - 資料陣列
     * @param {Object} options - 額外選項
     * @returns {string} HTML 字串
     */
    createBatch(type, dataArray, options = {}) {
        const methodMap = {
            'chapter': 'createChapterCard',
            'task': 'createTaskCard',
            'gallery': 'createGalleryItem',
            'stats': 'createStatsCard',
            'progress': 'createProgressBar',
            'activity': 'createActivityItem'
        };

        const method = methodMap[type];
        if (!method || !this[method]) {
            console.error(`Unknown component type: ${type}`);
            return '';
        }

        return dataArray.map(data => this[method](data, options.currentUserId)).join('');
    }
};

// 輸出到全域
window.ComponentFactory = ComponentFactory;
