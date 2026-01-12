const app = {
    state: {
        currentView: 'chapters-view',
        currentChapter: null,
        currentTask: null,
        token: localStorage.getItem('token'),
        currentChapter: null,
        currentTask: null,
        token: localStorage.getItem('token'),
        chapters: [], // Store loaded chapters
        user: null
    },

    init: () => {
        app.bindEvents();
        app.checkAuth();
        app.loadChapters();
    },

    checkAuth: async () => {
        const token = app.state.token; // Capture current token
        if (token) {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });

                // Race Condition Check: If token changed (e.g. fresh login), ignore this old check
                if (token !== app.state.token) return;

                // Only parse JSON if response is OK
                if (!res.ok) {
                    console.warn('checkAuth: API returned error, logging out');
                    app.logout();
                    return;
                }

                const user = await res.json();
                app.state.user = user;
                app.updateAuthUI(true);
                app.updateUserStats();
            } catch (err) {
                console.error('checkAuth error:', err);
                // Only logout if token hasn't changed
                if (token !== app.state.token) return;
                app.logout();
            }
        } else {
            app.updateAuthUI(false);
        }
    },

    updateAuthUI: (isLoggedIn) => {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userStats = document.getElementById('user-stats-header');

        if (isLoggedIn) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userStats.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userStats.classList.add('hidden');
        }
    },

    login: async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                app.state.token = data.token;
                app.state.user = data.user;
                app.updateAuthUI(true);
                app.updateUserStats();
                app.showView('chapters-view');
            } else {
                alert(data.msg || '登入失敗');
            }
        } catch (err) {
            console.error(err);
            alert('登入錯誤');
        }
    },

    register: async (nickname, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                app.state.token = data.token;
                app.state.user = data.user;
                app.updateAuthUI(true);
                app.updateUserStats();
                app.showView('chapters-view');
            } else {
                alert(data.msg || '註冊失敗');
            }
        } catch (err) {
            console.error(err);
            alert('註冊錯誤');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        app.state.token = null;
        app.state.user = null;
        app.updateAuthUI(false);
        app.showView('auth-view');
    },

    updateUserStats: async () => {
        if (!app.state.user) return; // Don't update if no user
        try {
            const res = await fetch('/api/user/profile', {
                headers: { 'x-auth-token': app.state.token }
            });
            const user = await res.json();
            const xpBar = document.querySelector('.xp-bar');
            const levelBadge = document.querySelector('.level-badge');

            // Calc XP Progress for current level (Simple: mod 500)
            const currentLevelXP = user.xp % 500;
            const progress = (currentLevelXP / 500) * 100;

            xpBar.style.width = `${progress}%`;
            levelBadge.textContent = `LV.${user.level}`;
            levelBadge.title = `XP: ${user.xp} (Next Level: ${500 - currentLevelXP} XP needed)`;
        } catch (e) { console.error("Stats update failed", e); }
    },

    bindEvents: () => {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                app.showView(target);

                // Update active nav state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                if (target === 'gallery-view') {
                    if (!app.state.token) {
                        alert("請先登入以查看作品");
                        app.showView('auth-view');
                        return;
                    }
                    app.loadGallery();
                }
                if (target === 'review-view') {
                    if (!app.state.token) {
                        alert("請先登入以查看回顧");
                        app.showView('auth-view');
                        return;
                    }
                    app.loadReview();
                }
            });
        });

        // Submission Form
        const form = document.getElementById('submission-form');
        if (form) {
            form.addEventListener('submit', app.handleSubmission);
        }

        // Auth Form
        const authForm = document.getElementById('auth-form');
        const authSubmitBtn = document.getElementById('auth-submit-btn');
        const toggleAuthMode = document.getElementById('toggle-auth-mode');
        const authTitle = document.getElementById('auth-title');
        const nicknameGroup = document.getElementById('nickname-group');

        let isLoginMode = true;

        if (toggleAuthMode) {
            toggleAuthMode.addEventListener('click', (e) => {
                e.preventDefault();
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authTitle.textContent = "登入 PhotoMission";
                    authSubmitBtn.textContent = "登入";
                    nicknameGroup.classList.add('hidden');
                    toggleAuthMode.textContent = "沒有帳號？點此註冊";
                    document.querySelector('input[name="nickname"]').required = false;
                } else {
                    authTitle.textContent = "註冊帳號";
                    authSubmitBtn.textContent = "註冊";
                    nicknameGroup.classList.remove('hidden');
                    toggleAuthMode.textContent = "已有帳號？點此登入";
                    document.querySelector('input[name="nickname"]').required = true;
                }
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(authForm);
                const email = formData.get('email');
                const password = formData.get('password');
                const nickname = formData.get('nickname');

                if (isLoginMode) {
                    app.login(email, password);
                } else {
                    // Password Strength Validation
                    const isPasswordValid = password.length > 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
                    if (!isPasswordValid) {
                        app.showAlert('密碼強度不足', '請確保密碼：\n1. 長度大於 8 碼\n2. 包含英文及數字');
                        return;
                    }
                    app.register(nickname, email, password);
                }
            });
        }

        // Edit Modal Events
        const editCancelBtn = document.getElementById('edit-cancel-btn');
        const editSaveBtn = document.getElementById('edit-save-btn');
        if (editCancelBtn) editCancelBtn.addEventListener('click', app.closeEditModal);
        if (editSaveBtn) editSaveBtn.addEventListener('click', app.saveEdit);

        // Message Modal Events
        const msgOkBtn = document.getElementById('msg-modal-ok-btn');
        if (msgOkBtn) {
            msgOkBtn.addEventListener('click', () => {
                const modal = document.getElementById('message-modal');
                modal.classList.add('hidden');
                modal.style.display = ''; // Clear inline style to let CSS take over
            });
        }
    },

    // Helper: Show Custom Alert Modal
    showAlert: (title, message) => {
        document.getElementById('msg-modal-title').textContent = title;
        document.getElementById('msg-modal-text').textContent = message;
        const modal = document.getElementById('message-modal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Ensure flex layout for centering
    },

    showView: (viewId) => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        app.state.currentView = viewId;
        window.scrollTo(0, 0);

        // Background Logic
        const body = document.body;
        // Remove all previous bg classes (including task specific ones)
        const bgClasses = Array.from(body.classList).filter(c => c.startsWith('bg-ch') || c === 'bg-home');
        body.classList.remove(...bgClasses);

        if (viewId === 'chapters-view' || viewId === 'gallery-view' || viewId === 'review-view') {
            body.classList.add('bg-home');
        } else if (viewId === 'tasks-view') {
            // handled by loadTasks which sets bg-chX
            // If we are navigating back to tasks view (e.g. from detail), we need to ensure bg is correct
            // But loadTasks is usually called to enter this view.
            // If we just switch view without loadTasks, we might lose it?
            // Let's rely on loadTasks setting it.
            // HOWEVER, if we are in submission-view (Task Detail), we want to KEEP the bg-chX
        } else if (viewId === 'submission-view') {
            // Check if we have a current chapter in tasks to infer bg
            if (app.state.currentChapterTasks && app.state.currentChapterTasks.length > 0) {
                const chId = app.state.currentChapterTasks[0].chapterId;
                body.classList.add(`bg-ch${chId}`);
            }
        }
    },

    loadChapters: async () => {
        const container = document.getElementById('chapters-container');
        container.innerHTML = '<div class="loading-spinner">載入中...</div>';

        try {
            const res = await fetch('/api/chapters');

            // Check if response is OK before parsing
            let chapters = [];
            if (res.ok) {
                chapters = await res.json();
            } else {
                console.warn('loadChapters: API returned error, using mock data');
            }

            // If empty or error, use Mock Data for Demo
            const data = (chapters && chapters.length > 0) ? chapters : app.mockData.chapters;
            app.state.chapters = data; // Save to state for resource access

            container.innerHTML = data.map(chapter => `
                <div class="card ${chapter.unlocked ? '' : 'locked'}" onclick="${chapter.unlocked ? `app.loadTasks('${chapter.id}')` : ''}">
                    <div class="card-header">
                        <span class="chapter-number">CHAPTER ${chapter.order}</span>
                        ${chapter.unlocked ? '🔓' : '🔒'}
                    </div>
                    <h3 class="card-title">${chapter.title}</h3>
                    <p class="card-desc">${chapter.description || '完成前置條件以解鎖此章節'}</p>
                    ${chapter.youtubeLink ? `
                        <div class="card-actions" style="margin-top: 10px;">
                            <a href="${chapter.youtubeLink}" target="_blank" onclick="event.stopPropagation();" class="btn-youtube" style="display: inline-block; padding: 5px 10px; background: #ff0000; color: white; text-decoration: none; border-radius: 4px; font-size: 0.8em;">
                                ▶ Watch Tutorial
                            </a>
                        </div>
                    ` : ''}
                </div>
            `).join('');

        } catch (err) {
            console.error("loadChapters error:", err);
            // Use Mock Data on any error
            const data = app.mockData.chapters;
            container.innerHTML = data.map(chapter => `
                <div class="card ${chapter.unlocked ? '' : 'locked'}" onclick="${chapter.unlocked ? `app.loadTasks('${chapter.id}')` : ''}">
                    <div class="card-header">
                        <span class="chapter-number">CHAPTER ${chapter.order}</span>
                        ${chapter.unlocked ? '🔓' : '🔒'}
                    </div>
                    <h3 class="card-title">${chapter.title}</h3>
                    <p class="card-desc">${chapter.description || '完成前置條件以解鎖此章節'}</p>
                </div>
            `).join('');
        }
    },

    loadTasks: async (chapterId) => {
        // Find current chapter from state to get the correct order/number
        const chapter = app.state.chapters.find(c => c.id == chapterId || c._id == chapterId);
        const titleEl = document.getElementById('current-chapter-title');
        titleEl.textContent = `Chapter ${chapter ? chapter.order : 'Unknown'} 任務列表`;

        // Update Background
        const body = document.body;
        // Clean existing (though showView might have done it, double check)
        body.classList.remove('bg-home', 'bg-ch1', 'bg-ch2', 'bg-ch3', 'bg-ch4', 'bg-ch5', 'bg-ch6', 'bg-ch7', 'bg-ch8');
        body.classList.add(`bg-ch${chapterId}`);

        const container = document.getElementById('tasks-container');

        // --- Render Chapter Resources ---
        // Chapter is already defined above

        let resourcesHtml = '';

        if (chapter && chapter.resources) {
            const { videos, articles } = chapter.resources;
            if ((videos && videos.length > 0) || (articles && articles.length > 0)) {
                resourcesHtml = `
                    <div class="resources-section" style="background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h4 style="margin-top:0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px;">📚 本章學習資源 (Recommended Resources)</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            ${videos && videos.length > 0 ? `
                                <div>
                                    <h5 style="color: #e63946; margin-bottom: 10px;">🎥 推薦影片 (Videos)</h5>
                                    <ul style="list-style: none; padding: 0;">
                                        ${videos.map(v => `
                                            <li style="margin-bottom: 12px;">
                                                <a href="${v.link}" target="_blank" style="text-decoration: none; color: #333; font-weight: 500; display: block;">
                                                    📺 ${v.title}
                                                </a>
                                                <div style="font-size: 0.85em; color: #666; margin-top: 4px; padding-left: 24px;">
                                                    ${v.description || ''}
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${articles && articles.length > 0 ? `
                                <div>
                                    <h5 style="color: #457b9d; margin-bottom: 10px;">📄 推薦文章 (Articles)</h5>
                                    <ul style="list-style: none; padding: 0;">
                                        ${articles.map(a => `
                                            <li style="margin-bottom: 12px;">
                                                <a href="${a.link}" target="_blank" style="text-decoration: none; color: #333; font-weight: 500; display: block;">
                                                    📑 ${a.title}
                                                </a>
                                                <div style="font-size: 0.85em; color: #666; margin-top: 4px; padding-left: 24px;">
                                                    ${a.description || ''}
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = resourcesHtml + '<div class="loading-spinner">載入任務中...</div>';

        try {
            // Fetch tasks for this chapter from backend
            const res = await fetch(`/api/tasks?chapterId=${chapterId}`);
            const tasks = await res.json();

            if (!tasks || tasks.length === 0) {
                container.innerHTML = '<p>本章節尚無任務。</p>';
                app.showView('tasks-view');
                return;
            }

            // Save tasks to state or strictly use them here. 
            // We need them later for openTaskDetail, so let's update mockData cache or state
            // A simple way is to just put them in a temp storage or just re-fetch (but re-fetch is slow).
            // Let's update `app.state.currentChapterTasks`
            app.state.currentChapterTasks = tasks;

            container.innerHTML = tasks.map(task => `
                <div class="card" onclick="app.openTaskDetail('${task.id}')">
                    <div class="card-header">
                        <span class="chapter-number">TASK ${task.order}</span>
                        <span class="badge">Diff: ${task.difficulty}</span>
                    </div>
                    <h3 class="card-title">${task.title}</h3>
                    <p class="card-desc">${task.concept}</p>
                    <div style="margin-top: 10px; font-size: 0.8em; color: #888;">
                        ⏱ ${task.duration} min
                    </div>
                </div>
            `).join('');

            // Prepend resources if available (already in container but overwritten by map join? No, wait)
            // Ah, container.innerHTML was set to spinner + resources. Now we are overwriting it.
            // We need to keep resourcesHtml.
            container.innerHTML = resourcesHtml + tasks.map(task => `
                <div class="card" onclick="app.openTaskDetail('${task.id}')">
                    <div class="card-header">
                        <span class="chapter-number">TASK ${task.order}</span>
                        <span class="badge">Diff: ${task.difficulty}</span>
                    </div>
                    <h3 class="card-title">${task.title}</h3>
                    <p class="card-desc">${task.concept}</p>
                    <div style="margin-top: 10px; font-size: 0.8em; color: #888;">
                        ⏱ ${task.duration} min
                    </div>
                </div>
            `).join('');

            app.showView('tasks-view');

        } catch (err) {
            console.error("Failed to load tasks:", err);
            container.innerHTML = '<p>任務載入失敗，請稍後再試。</p>';
            app.showView('tasks-view');
        }
    },

    openTaskDetail: (taskId) => {
        // Find task from the loaded tasks in state
        const task = app.state.currentChapterTasks ?
            app.state.currentChapterTasks.find(t => t.id == taskId) :
            null;

        if (!task) {
            console.error("Task not found in state");
            return;
        }

        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-concept').textContent = task.concept;
        document.getElementById('task-instructions').textContent = task.instructions;
        document.getElementById('task-difficulty').textContent = `難度 ${task.difficulty} | ⏱ ${task.duration}m`;
        document.getElementById('submit-task-id').value = task.id;

        // Render Tutorial Link
        const instructionsBox = document.querySelector('.instruction-box p#task-instructions');
        // Clear previous links if any (simple hack: recreate the p or append safely)

        // Remove existing tutorial links from DOM if they exist to avoid duplication
        const existingResources = document.querySelector('.task-resources-section');
        if (existingResources) existingResources.remove();
        const existingLink = document.getElementById('tutorial-link-container');
        if (existingLink) existingLink.remove();

        if (task.resources && task.resources.length > 0) {
            const resourcesDiv = document.createElement('div');
            resourcesDiv.className = 'task-resources-section';
            resourcesDiv.style.marginBottom = '25px';
            resourcesDiv.style.marginTop = '15px';
            resourcesDiv.innerHTML = `
                <h4 style="margin-bottom: 12px; border-bottom: 2px solid #eee; padding-bottom: 8px; font-size: 1.1em; color: #444;">📚 學習資源 (Learning Materials)</h4>
                ${task.resources.map(res => `
                    <div class="resource-item" style="background: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid ${res.type === 'video' ? '#e74c3c' : '#2ecc71'}; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #333; display: flex; align-items: center; font-size: 1.05em;">
                            <span style="margin-right: 10px; font-size: 1.3em;">${res.type === 'video' ? '📺' : '📄'}</span>
                            <a href="${res.link}" target="_blank" style="color: #2c3e50; text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s;" onmouseover="this.style.borderBottom='1px solid #2c3e50'" onmouseout="this.style.borderBottom='1px solid transparent'">
                                ${res.title}
                            </a>
                            <span style="font-size: 0.8em; color: #aaa; margin-left: auto;">↗</span>
                        </div>
                        ${res.summary ? `
                            <div class="resource-summary" style="margin-top: 10px; font-size: 0.95em; color: #555; line-height: 1.6; background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px solid #eee;">
                                ${res.summary.replace(/\n/g, '<br>')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            `;
            instructionsBox.parentNode.insertBefore(resourcesDiv, instructionsBox);
        } else if (task.tutorialLink) {
            const linkDiv = document.createElement('div');
            linkDiv.id = 'tutorial-link-container';
            linkDiv.style.marginTop = '15px';
            linkDiv.style.padding = '10px';
            linkDiv.style.background = '#f0f0f0';
            linkDiv.style.borderLeft = '4px solid #000';

            linkDiv.innerHTML = `
                <strong>🎥 學習資源：</strong><br>
                <a href="${task.tutorialLink}" target="_blank" style="color: #000; text-decoration: underline;">
                    📺 觀看教學影片 (YouTube)
                </a>
                ${task.refLink ? `<br><a href="${task.refLink}" target="_blank" style="color: #666; font-size: 0.9em;">📄 參考文章</a>` : ''}
            `;
            instructionsBox.parentNode.insertBefore(linkDiv, instructionsBox);
        }

        // --- UX Enhancement: Beginner Tips Toggle ---
        // Basic Tips Mapping (could be in DB, hardcoded for MVP)
        const tipsMap = {
            'focus': '💡 提示：對焦就像是告訴相機「主角是誰」。主體清楚，背景模糊，照片會更有質感。',
            'exposure': '💡 提示：曝光就是照片的亮度。太亮叫過曝（白成一片），太暗叫曝光不足（黑成一片）。',
            'shutter': '💡 提示：快門越快，越能凍結動作（適合運動）；快門越慢，越能拍出流動感（適合車軌、瀑布）。',
            'composition': '💡 提示：試著不要把主角永遠放在正中間。放在畫面的 1/3 處通常更自然。'
        };
        // Simple keyword match
        let tipContent = "💡 攝影小撇步：多拍幾張，總有一張是好的！";
        if (task.tags) {
            if (task.tags.some(t => t.includes('focus'))) tipContent = tipsMap['focus'];
            else if (task.tags.some(t => t.includes('exposure'))) tipContent = tipsMap['exposure'];
            else if (task.tags.some(t => t.includes('composition'))) tipContent = tipsMap['composition'];
        }

        const tipsContainer = document.createElement('div');
        tipsContainer.innerHTML = `
            <div class="beginner-tips-toggle" onclick="app.toggleBeginnerTips(this)">
                <span>🔰 新手小提示 (Beginner Tips)</span>
                <span>▼</span>
            </div>
            <div class="beginner-tips-content hidden">
                ${tipContent}
            </div>
        `;
        // Insert before Concept Card
        const conceptCard = document.querySelector('.concept-card');
        conceptCard.parentNode.insertBefore(tipsContainer, conceptCard);
        // ---------------------------------------------

        // Apply Specific Task Background
        const body = document.body;
        // Remove current chapter background to be replaced by task background
        body.classList.remove(`bg-ch${task.chapterId}`);
        body.classList.add(`bg-ch${task.chapterId}-task${task.order}`);

        app.showView('submission-view');
    },

    toggleBeginnerTips: (el) => {
        const content = el.nextElementSibling;
        content.classList.toggle('hidden');
        el.querySelector('span:last-child').textContent = content.classList.contains('hidden') ? '▼' : '▲';
    },

    handleSubmission: async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Add dummy ratings if not present in form (just in case)
        if (!formData.has('sharpness')) formData.append('sharpness', 5);
        if (!formData.has('exposure')) formData.append('exposure', 5);
        if (!formData.has('composition')) formData.append('composition', 5);
        if (!formData.has('lighting')) formData.append('lighting', 5);

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'x-auth-token': app.state.token }, // Add token
                body: formData
            });

            if (res.status === 401) {
                alert("請先登入");
                app.showView('auth-view');
                return;
            }

            if (res.ok) {
                const data = await res.json(); // Get response with XP
                let msg = "提交成功！";
                if (data.xpEarned) {
                    msg += `\n✨ 獲得 ${data.xpEarned} XP!`;
                }
                if (data.currentLevel) {
                    // Check local state or just show current level
                    msg += `\n當前等級: LV.${data.currentLevel}`;
                }
                alert(msg);
                form.reset();
                app.updateUserStats(); // Update header
                app.showView('gallery-view');
                app.loadGallery();
            } else {
                const err = await res.json();
                alert("提交失敗：" + (err.error || "未知錯誤"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("提交失敗：網絡錯誤");
        }
    },

    switchGalleryTab: (tab) => {
        app.state.galleryTab = tab;

        // Update tab button states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // Reload gallery with new tab
        app.loadGallery();
    },

    loadGallery: async () => {
        const container = document.getElementById('gallery-container');
        container.innerHTML = '<div class="loading-spinner">載入作品中...</div>';

        try {
            const endpoint = app.state.galleryTab === 'my'
                ? '/api/submissions/my'
                : '/api/submissions/public';

            const headers = app.state.galleryTab === 'my'
                ? { 'x-auth-token': app.state.token }
                : {};

            const res = await fetch(endpoint, { headers });
            const submissions = await res.json();

            if (!submissions || submissions.length === 0) {
                container.innerHTML = '<p>尚無作品，快去完成任務吧！</p>';
                return;
            }

            container.innerHTML = submissions.map(sub => {
                // Determine image source
                const imgSrc = sub.photos && sub.photos.length > 0 ? sub.photos[0] : '';
                const dateStr = new Date(sub.createdAt).toLocaleDateString();
                const isOwnSubmission = app.state.user && app.state.user._id === sub.userId._id;
                const showAuthor = app.state.galleryTab === 'public';
                const authorName = sub.userId?.nickname || '匿名用戶';

                return `
                <div class="gallery-item" id="submission-${sub._id}">
                    <div style="height: 200px; background: #eee; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${imgSrc ? `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="作品">` : '無圖片'}
                    </div>
                    <div class="gallery-info">
                        ${showAuthor ? `<p><strong>👤 作者:</strong> ${authorName}</p>` : ''}
                        <p><strong>提交時間:</strong> ${dateStr}</p>
                        <p><span id="reflection-${sub._id}">${sub.reflection ? `心得: ${sub.reflection}` : ''}</span></p>
                        <div class="gallery-actions">
                            <button class="like-btn" onclick="app.toggleLike('${sub._id}', this)">❤️ <span class="like-count">${sub.likes || 0}</span></button>
                            ${isOwnSubmission || app.state.galleryTab === 'my' ? `
                                <button class="btn-sm" onclick="app.openEditModal('${sub._id}', '${sub.reflection || ''}')">✏️</button>
                                <button class="btn-sm" style="color:red;" onclick="app.deleteSubmission('${sub._id}')">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `}).join('');
        } catch (err) {
            console.error("Failed to load gallery:", err);
            container.innerHTML = '<p>載入失敗，請稍後再試。</p>';
        }
    },

    toggleLike: async (id, btn) => {
        if (!app.state.token) {
            alert("請先登入");
            app.showView('auth-view');
            return;
        }
        try {
            const res = await fetch(`/api/submissions/${id}/like`, {
                method: 'POST',
                headers: { 'x-auth-token': app.state.token }
            });
            if (res.ok) {
                const data = await res.json();
                const countSpan = btn.querySelector('.like-count');
                countSpan.textContent = data.likes;
                btn.style.transform = "scale(1.3)";
                setTimeout(() => btn.style.transform = "scale(1)", 200);
            }
        } catch (e) { console.error("Like failed", e); }
    },

    openEditModal: (submissionId, currentReflection) => {
        const modal = document.getElementById('edit-modal');
        const input = document.getElementById('edit-reflection-input');
        const idField = document.getElementById('edit-submission-id');

        idField.value = submissionId;
        input.value = currentReflection;
        modal.classList.remove('hidden');
    },

    closeEditModal: () => {
        const modal = document.getElementById('edit-modal');
        modal.classList.add('hidden');
    },

    saveEdit: async () => {
        const submissionId = document.getElementById('edit-submission-id').value;
        const newReflection = document.getElementById('edit-reflection-input').value;

        if (!app.state.token) {
            alert("請先登入");
            app.closeEditModal();
            return;
        }

        try {
            const res = await fetch(`/api/submissions/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': app.state.token
                },
                body: JSON.stringify({ reflection: newReflection })
            });

            if (res.ok) {
                alert("更新成功！");
                app.closeEditModal();
                // Update the reflection text in the gallery item
                const reflectionEl = document.getElementById(`reflection-${submissionId}`);
                if (reflectionEl) {
                    reflectionEl.textContent = newReflection ? `心得: ${newReflection}` : '';
                }
            } else {
                const err = await res.json();
                alert("更新失敗：" + (err.error || "未知錯誤"));
            }
        } catch (error) {
            console.error("Edit error:", error);
            alert("更新失敗：網絡錯誤");
        }
    },

    deleteSubmission: async (submissionId) => {
        if (!confirm("確定要刪除這個作品嗎？此操作無法復原。")) {
            return;
        }

        if (!app.state.token) {
            alert("請先登入");
            return;
        }

        try {
            const res = await fetch(`/api/submissions/${submissionId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': app.state.token }
            });

            if (res.ok) {
                alert("刪除成功！");
                // Remove the item from the DOM
                const item = document.getElementById(`submission-${submissionId}`);
                if (item) {
                    item.remove();
                }
            } else {
                const err = await res.json();
                alert("刪除失敗：" + (err.error || "未知錯誤"));
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("刪除失敗：網絡錯誤");
        }
    },

    loadReview: async () => {
        try {
            // Fetch all data needed
            const [subRes, tasksRes] = await Promise.all([
                fetch('/api/submissions'),
                fetch('/api/tasks')
            ]);

            // Check if responses are OK before parsing JSON
            if (!subRes.ok || !tasksRes.ok) {
                console.warn('loadReview: API returned error, using fallback');
                // Set empty/fallback data
                document.getElementById('review-task-count').textContent = '0';
                document.getElementById('review-photo-count').textContent = '0';
                return;
            }

            const submissions = await subRes.json();
            const allTasks = await tasksRes.json();

            // 1. Overview Stats
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter for this month
            const thisMonthSubs = submissions.filter(s => {
                const d = new Date(s.createdAt);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            // Filter for last month
            const lastMonthSubs = submissions.filter(s => {
                const d = new Date(s.createdAt);
                // Simple check for previous month handle year wrap
                let prevMonth = currentMonth - 1;
                let prevYear = currentYear;
                if (prevMonth < 0) { prevMonth = 11; prevYear--; }
                return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
            });

            // Count Task Completions (Unique tasks this month)
            const uniqueTaskIdsThisMonth = new Set(thisMonthSubs.map(s => s.taskId));
            const uniqueTaskIdsLastMonth = new Set(lastMonthSubs.map(s => s.taskId));

            // Total Photos Uploaded
            const totalPhotos = submissions.reduce((acc, curr) => acc + (curr.photos ? curr.photos.length : 0), 0);
            const thisMonthPhotos = thisMonthSubs.reduce((acc, curr) => acc + (curr.photos ? curr.photos.length : 0), 0);
            const lastMonthPhotos = lastMonthSubs.reduce((acc, curr) => acc + (curr.photos ? curr.photos.length : 0), 0);

            // Calculate Growth
            const taskGrowth = uniqueTaskIdsThisMonth.size - uniqueTaskIdsLastMonth.size;
            const photoGrowth = thisMonthPhotos - lastMonthPhotos;

            document.getElementById('review-task-count').textContent = uniqueTaskIdsThisMonth.size;
            const taskGrowthEl = document.getElementById('review-task-change');
            taskGrowthEl.textContent = `${taskGrowth >= 0 ? '+' : ''}${taskGrowth} vs 上月`;
            taskGrowthEl.className = `stat-change ${taskGrowth >= 0 ? 'positive' : 'negative'}`;

            document.getElementById('review-photo-count').textContent = totalPhotos;
            const photoGrowthEl = document.getElementById('review-photo-change');
            photoGrowthEl.textContent = `${photoGrowth >= 0 ? '+' : ''}${photoGrowth} (本月)`;
            photoGrowthEl.className = 'stat-change'; // just neutral for total accumulation context or positive

            // 2. Chapter Progress
            // Identify how many distinct chapters have at least one completed task
            // Map taskIds to ChapterIds
            const taskMap = {};
            allTasks.forEach(t => taskMap[t.id] = t);

            // Get all unique tasks ever completed
            const allCompletedTaskIds = new Set(submissions.map(s => s.taskId));
            const completedChapters = new Set();
            allCompletedTaskIds.forEach(tid => {
                if (taskMap[tid]) completedChapters.add(taskMap[tid].chapterId);
            });
            const progress = completedChapters.size;
            document.getElementById('review-chapter-progress').textContent = `${progress} / 8`;


            // 3. Skill Analysis (Average Ratings)
            let skills = { sharpness: 0, exposure: 0, composition: 0, lighting: 0 };
            let count = 0;

            submissions.forEach(s => {
                if (s.rating) {
                    skills.sharpness += parseInt(s.rating.sharpness || 0);
                    skills.exposure += parseInt(s.rating.exposure || 0);
                    skills.composition += parseInt(s.rating.composition || 0);
                    skills.lighting += parseInt(s.rating.lighting || 0);
                    count++;
                }
            });

            if (count > 0) {
                // Convert to percentage (avg / 5 * 100)
                const setBar = (id, total) => {
                    const avg = total / count;
                    const pct = (avg / 5) * 100;
                    document.getElementById(id).style.width = `${pct}%`;
                    document.getElementById(id).textContent = avg.toFixed(1);
                };
                setBar('skill-sharpness', skills.sharpness);
                setBar('skill-exposure', skills.exposure);
                setBar('skill-composition', skills.composition);
                setBar('skill-lighting', skills.lighting);
            }

            // 4. Recent Activity
            const list = document.getElementById('review-recent-activity');
            const recent = submissions.slice(0, 5); // Get last 5
            if (recent.length === 0) {
                list.innerHTML = '<li>尚無近期活動</li>';
            } else {
                list.innerHTML = recent.map(s => {
                    const tName = taskMap[s.taskId] ? taskMap[s.taskId].title : `Task ${s.taskId}`;
                    const d = new Date(s.createdAt).toLocaleDateString();
                    return `
                        <li>
                            <span class="activity-date">${d}</span>
                            <span class="activity-desc">完成了 <strong>${tName}</strong></span>
                        </li>
                    `;
                }).join('');
            }


        } catch (err) {
            console.error("Failed to load review:", err);
        }
    },

    // Mock Data for Fallback/MVP
    mockData: {
        chapters: [
            { id: 0, title: "起步與設定", unlocked: true, description: "工欲善其事，必先利其器" },
            { id: 1, title: "曝光與清晰", unlocked: true, description: "掌握光線的進出，與畫面的清晰度" },
            { id: 2, title: "構圖與視線引導", unlocked: true, description: "如何安排畫面中的元素" },
            { id: 3, title: "光線", unlocked: true, description: "看見光，運用光" }
        ],
        tasks: [
            { id: 101, chapterId: 0, order: 1, title: "握持與穩定", concept: "穩定的相機是清晰照片的基礎", instructions: "拍攝 3 張使用不同支撐方式的照片", difficulty: 1 },
            { id: 102, chapterId: 0, order: 2, title: "了解你的鏡頭", concept: "廣角 vs 長焦", instructions: "分別用最廣角與最望遠端拍攝同一主體", difficulty: 1 },
            { id: 201, chapterId: 1, order: 1, title: "尋找正確曝光", concept: "曝光補償 (EV)", instructions: "拍攝過曝、曝光不足、正確曝光各一張", difficulty: 2 }
        ]
    }
};

document.addEventListener('DOMContentLoaded', app.init);
