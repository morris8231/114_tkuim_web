// EventBus - Observer Pattern Implementation
// 全域事件中心，用於解耦元件間的通訊

class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 訂閱事件
     * @param {string} eventName - 事件名稱
     * @param {Function} callback - 回調函式
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 取消訂閱事件
     * @param {string} eventName - 事件名稱
     * @param {Function} callback - 要移除的回調函式
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;

        this.events[eventName] = this.events[eventName].filter(
            cb => cb !== callback
        );
    }

    /**
     * 觸發事件
     * @param {string} eventName - 事件名稱
     * @param {*} data - 傳遞給回調的資料
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;

        this.events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event ${eventName} callback:`, error);
            }
        });
    }

    /**
     * 單次訂閱（觸發一次後自動取消）
     * @param {string} eventName - 事件名稱
     * @param {Function} callback - 回調函式
     */
    once(eventName, callback) {
        const onceWrapper = (data) => {
            callback(data);
            this.off(eventName, onceWrapper);
        };
        this.on(eventName, onceWrapper);
    }

    /**
     * 清除所有事件監聽器
     */
    clear() {
        this.events = {};
    }

    /**
     * 獲取所有已註冊的事件名稱
     */
    getEventNames() {
        return Object.keys(this.events);
    }

    /**
     * 獲取特定事件的監聽器數量
     */
    getListenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }
}

// 創建全域單例
const eventBus = new EventBus();

// 預定義的事件類型（方便開發時使用）
const EVENT_TYPES = {
    PROGRESS_UPDATED: 'progressUpdated',
    CHAPTER_UNLOCKED: 'chapterUnlocked',
    TASK_COMPLETED: 'taskCompleted',
    XP_GAINED: 'xpGained',
    LEVEL_UP: 'levelUp',
    SUBMISSION_CREATED: 'submissionCreated',
    SUBMISSION_UPDATED: 'submissionUpdated',
    SUBMISSION_DELETED: 'submissionDeleted',
    USER_LOGGED_IN: 'userLoggedIn',
    USER_LOGGED_OUT: 'userLoggedOut'
};

// 輸出到全域
window.eventBus = eventBus;
window.EVENT_TYPES = EVENT_TYPES;
