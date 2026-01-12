require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');
const Task = require('../models/Task');

// Config
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_learning';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB...');

        // Clear existing data
        await Chapter.deleteMany({});
        await Task.deleteMany({});
        console.log('🧹 Cleared existing Chapters and Tasks');

        // 1. Create Chapters
        // New Order: 
        // 0: Start
        // 1: Exposure
        // 2: Composition
        // 3: Light
        // 4: Color (Was 6)
        // 5: Portrait (Was 4)
        // 6: Street (Was 5)
        // 7: Food (Was 8)
        // 8: Portfolio (Was 7)
        const chapters = await Chapter.insertMany([
            {
                title: "主題 0：起步與設定",
                description: "建立正確拍攝姿勢與穩定度、理解鏡頭焦段觀念，以及掌握對焦與安全快門。",
                order: 0,
                unlockRule: { requiredTasks: 0 },
                resources: { videos: [], articles: [] }
            },
            {
                title: "主題 1：曝光與清晰",
                description: "掌握光線的進出，與畫面的清晰度",
                order: 1,
                unlockRule: { requiredTasks: 2 },
                resources: {
                    videos: [
                        { title: "Exposure Basics: ISO, Shutter Speed and Aperture Explained", link: "https://www.youtube.com/watch?v=FirstLinkResult_Placeholder_BH", description: "B\&H Photo Video 講解曝光三要素運作方式。" }
                    ],
                    articles: [
                        { title: "曝光三角 (Tim Ting Photography)", link: "https://www.google.com/search?q=Tim+Ting+Photography+%E6%9B%9D%E5%85%89%E4%B8%89%E8%A7%92", description: "用畫畫比喻說明光圈、快門與 ISO 的關係。" }
                    ]
                }
            },
            {
                title: "主題 2：構圖與視線引導",
                description: "如何安排畫面中的元素",
                order: 2,
                unlockRule: { requiredTasks: 3 },
                resources: {
                    videos: [
                        { title: "Composition – Rule of Thirds (Adorama TV)", link: "https://www.youtube.com/results?search_query=Adorama+TV+Composition+Rule+of+Thirds", description: "Adorama TV 教學：將畫面想像成井字格並把主體放在交點或線上。" }
                    ],
                    articles: [
                        { title: "基本構圖概念 (Fotobeginner)", link: "https://www.google.com/search?q=Fotobeginner+%E5%9F%BA%E6%9C%AC%E6%A7%8B%E5%9C%96%E6%A6%82%E5%BF%B5", description: "三分法是最簡單、最適用的構圖方式。" }
                    ]
                }
            },
            {
                title: "主題 3：光線",
                description: "看見光，運用光",
                order: 3,
                unlockRule: { requiredTasks: 3 },
                resources: {
                    videos: [
                        { title: "Portrait Lighting 101", link: "https://www.youtube.com/results?search_query=Portrait+Lighting+101", description: "講解順光、側光與逆光的效果。" },
                        { title: "Understanding White Balance (DPS)", link: "https://www.youtube.com/results?search_query=Understanding+White+Balance+and+Colour+Temperature+Digital+Photography+School", description: "Digital Photography School: 理解白平衡與色溫。" }
                    ],
                    articles: [
                        { title: "光線方向介紹 (新攝影學院)", link: "https://www.google.com/search?q=%E6%96%B0%E6%94%9D%E5%BD%B1%E5%AD%B8%E9%99%A2+%E5%85%89%E7%B7%9A%E6%96%B9%E5%90%91", description: "順光、側光與逆光的應用。" },
                        { title: "Canon/Nikon 白平衡教學", link: "https://www.google.com/search?q=Canon+Nikon+%E7%99%BD%E5%B9%B3%E8%A1%A1%E6%95%99%E5%AD%B8", description: "說明如何在相機中調整白平衡以修正色溫問題。" }
                    ]
                }
            },
            {
                // Moved from 6 to 4
                title: "主題 4：攝影中的色彩",
                description: "色彩心理學與情境氛圍",
                order: 4,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=OXv_67i8UR4",
                resources: {
                    videos: [
                        { title: "通过颜色建立第一印象", link: "https://youtu.be/OXv_67i8UR4?si=fPCdvCjY76J9HX24", description: "色彩如何在極短時間內影響觀者的心理判斷與情緒感受。" },
                        { title: "攝影師如何拍出不同顏色的背景", link: "https://youtu.be/Hl3-ajQIivc?si=-Qn9EXmK-P7CSTkJ", description: "透過燈光配置與背景材質控制，在拍攝當下設計背景顏色與情緒。" }
                    ],
                    articles: [
                        { title: "【拍攝教學】閃光燈下的色彩藝術", link: "https://www.lomography.tw/magazine/336968-the-art-of-colorsplashing-tw", description: "介紹如何透過閃光燈搭配色片改變光線顏色，創造戲劇化的畫面情緒。" }
                    ]
                }
            },
            {
                // Was 4, now 5
                title: "主題 5：人像攝影",
                description: "情緒的傳達",
                order: 5,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=muXeSghtLwE",
                resources: {
                    videos: [
                        { title: "Color Theory in Photography for Beginners", link: "https://www.youtube.com/results?search_query=Color+Theory+in+Photography+for+Beginners", description: "色彩理論基礎教學。" }
                    ],
                    articles: [
                        { title: "Color Theory for Photographers (Photographylife)", link: "https://photographylife.com/landscapes/color-theory-photography", description: "攝影專用色彩理論介紹。" },
                        { title: "色彩心理學與配色法則", link: "https://www.google.com/search?q=%E6%94%9D%E5%BD%B1+%E8%89%B2%E5%BD%A9%E5%BF%83%E7%90%86%E5%AD%B8+%E9%85%8D%E8%89%B2", description: "中文部落格介紹色彩運用。" }
                    ]
                }
            },
            {
                // Was 5, now 6
                title: "主題 6：街拍與紀實",
                description: "捕捉真實的瞬間",
                order: 6,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=Cd-4KP0fF1k",
                resources: {
                    videos: [
                        { title: "How to Capture Street Photography Moments", link: "https://www.youtube.com/results?search_query=How+to+Capture+Street+Photography+Moments", description: "街頭攝影技巧與瞬間捕捉。" }
                    ],
                    articles: [
                        { title: "街拍攝影技巧教學", link: "https://www.google.com/search?q=%E8%A1%97%E6%8B%8D+%E6%94%9D%E5%BD%B1+%E6%8A%80%E5%B7%A7+%E6%95%99%E5%AD%B8", description: "中文街拍技巧與觀察力練習。" },
                        { title: "DPS Street Photography Tips", link: "https://digital-photography-school.com/category/photography-tips-and-tutorials/street-photography-tips/", description: "Digital Photography School 街拍系列文章。" }
                    ]
                }
            },
            {
                title: "主題 7：食物攝影",
                description: "透過自然光、構圖、質感細節掌握食物攝影核心技巧，建立個人食物攝影風格與作品表現手法。",
                order: 7,
                unlockRule: { requiredTasks: 3 },
                resources: {
                    videos: [
                        { title: "FOOD PHOTOGRAPHY NATURAL LIGHTING TIPS", link: "https://www.youtube.com/watch?v=MW6IW2ygWHg", description: "示範如何善用自然光（尤其側光與窗邊光）拍攝食物照片。" }
                    ],
                    articles: [
                        { title: "食物攝影有什麼技巧？9大構圖教學", link: "https://www.virllage.com/articles/foodphotography", description: "列出九大拍攝技巧，包括光線運用、角度選擇與質感呈現。" }
                    ]
                }
            },
            {
                // Was 7, now 8 (Swapped with Food)
                title: "主題 8：作品整理與個人風格",
                description: "整理作品集、回顧風格與成長紀錄，學會以系統化思維呈現你的攝影成果與美學脈絡。",
                order: 8,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=Q6zUlOYJ0l8",
                resources: {
                    videos: [
                        { title: "Photography Portfolio Tips — How to Select Your Best Photos", link: "https://www.youtube.com/watch?v=Q6zUlOYJ0l8", description: "示範如何從拍攝集選出「代表性、視覺統一性與敘事性」兼具的照片。" },
                        { title: "如何用作品集顯示你的攝影風格", link: "https://www.youtube.com/watch?v=YXRPR3y-tKw", description: "說明如何透過作品集建立自己的攝影語言，並分析相互呼應的風格特色。" }
                    ],
                    articles: [
                        { title: "11 Photography Portfolio Tips for Impressing People", link: "https://expertphotography.com/create-a-photography-portfolio/", description: "提供作品集挑選技巧，包括如何挑出最具代表性、品質高且能展示風格的照片。" }
                    ]
                }
            }
        ]);
        console.log(`✅ Created ${chapters.length} Chapters`);

        // 2. Create Tasks for Chapter 0
        const ch0 = chapters[0];
        await Task.insertMany([
            {
                chapterId: ch0._id,
                title: "0-1 握持與穩定",
                concept: "拍得穩、拍得清楚",
                instructions: "請上傳 3 張使用不同支撐方式（手持夾緊、依託牆壁、使用腳架/桌面）拍攝的照片，體會穩定度的差異。",
                difficulty: 1,
                order: 1,
                resources: [
                    { type: 'article', title: "穩定先決！怎樣拿好你的相機", link: "https://www.fotobeginner.com/9170/how-to-hold-your-camera/", summary: "說明正確的相機握持方式如何有效降低手震，包括雙手分工與支撐點運用。" },
                    { type: 'video', title: "How to Hold a Camera Properly", link: "https://www.youtube.com/watch?v=hISuhcK5vdE", summary: "示範正確與錯誤的相機握持姿勢，說明如何透過姿勢、呼吸與支撐點避免晃動。" }
                ]
            },
            {
                chapterId: ch0._id,
                title: "0-2 了解你的鏡頭",
                concept: "鏡頭視角",
                instructions: "站在同一位置，分別用最廣角端與最望遠端拍攝同一主體，觀察透視變化與空間感的不同。",
                difficulty: 1,
                order: 2,
                resources: [
                    { type: 'article', title: "Camera Lenses Explained — How Do They Work?", link: "https://www.studiobinder.com/blog/understanding-camera-lenses-explained/", summary: "從鏡頭原理與焦段概念切入，解釋廣角、標準、望遠鏡頭在視角與透視上的差異。" },
                    { type: 'video', title: "【硬核科普】焦段是什么？", link: "https://www.youtube.com/watch?v=Md3NVa_kwiE", summary: "解析「焦段」本質，說明焦段如何影響視角、空間感與畫面比例。" }
                ]
            },
            {
                chapterId: ch0._id,
                title: "0-3 對焦方式與安全快門",
                concept: "安全快門",
                instructions: "練習計算並使用你的安全快門速度進行拍攝（例如焦距倒數），比較不同快門速度下的清晰度。",
                difficulty: 2,
                order: 3,
                resources: [
                    { type: 'article', title: "「安全快門算法」：手持拍攝穩定清晰的秘密武器", link: "https://www.whbydcc.com/安全快門算法/", summary: "說明手持拍攝時，快門速度如何影響清晰度，以及焦段與手震的關係。" },
                    { type: 'video', title: "攝影新手一定會遇到的 5 種模糊原因", link: "https://www.youtube.com/watch?v=V7z7BAZdt2M", summary: "整理新手常遇到的模糊問題（手震、對焦錯誤等）並提供改善方式。" }
                ]
            }
        ]);

        // 3. Create Tasks for Chapter 1
        const ch1 = chapters[1];
        await Task.insertMany([
            {
                chapterId: ch1._id,
                title: "1-1 認識光圈、快門與 ISO",
                concept: "曝光三要素",
                instructions: "閱讀文章並觀看影片，理解光圈、快門與 ISO 的個別功能與相互影響。",
                difficulty: 1,
                order: 1,
                resources: [
                    { type: 'article', title: "什麼是光圈、快門與 ISO (Fotobeginner)", link: "https://www.fotobeginner.com/8867/understand-exposure-in-1-minute/", summary: "文章以極短時間帶領新手理解曝光三要素的核心概念：\n光圈控制進光量與景深\n快門決定畫面亮度與動態凝結\nISO影響感光度與畫質雜訊" },
                    { type: 'video', title: "曝光鐵三角：光圈、快門、ISO (我都 OK 啊)", link: "https://youtu.be/9i1IFAOXd60", summary: "透過實際拍攝畫面示範三個參數的變化效果，幫助學習者理解「為什麼不能只調一個參數」，而是必須整體思考曝光。" }
                ]
            },
            {
                chapterId: ch1._id,
                title: "1-2 曝光三角的關係",
                concept: "曝光補償與連動",
                instructions: "理解當調整其中一個參數時，如何調整其他參數以維持正確曝光。",
                difficulty: 2,
                order: 2,
                resources: [
                    { type: 'article', title: "The Exposure Triangle (Photography Life)", link: "https://photographylife.com/what-is-exposure-triangle", summary: "文章深入說明曝光三角的「補償關係」，讓學習者理解當光圈變大時，快門或 ISO 為何必須跟著調整，是從「會調參數」走向「懂得為何這樣調」的重要一步。" },
                    { type: 'video', title: "Exposure Triangle Explained (Tony & Chelsea Northrup)", link: "https://youtu.be/iWfdxE1om6A", summary: "影片以清楚的圖表與實拍案例解釋曝光三角的運作邏輯，節奏明快、邏輯清晰，非常適合作為理論補強影片。" }
                ]
            },
            {
                chapterId: ch1._id,
                title: "1-3 對焦與清晰判斷",
                concept: "對焦模式",
                instructions: "練習選擇正確的對焦模式（AF-S vs AF-C）並精準對焦於主體。",
                difficulty: 2,
                order: 3,
                resources: [
                    { type: 'article', title: "5 個攝影新手必學的對焦技巧 (Fotobeginner)", link: "https://www.fotobeginner.com/22241/5-tips-of-focusing/", summary: "文章整理新手最常遇到的對焦問題，包含：對焦點選錯、主體移動導致失焦、景深誤判，並提供實際可操作的改善建議。" },
                    { type: 'video', title: "攝影對焦模式完整解析 (Zusi Ai)", link: "https://youtu.be/VgmTd5UYVzk", summary: "影片詳細說明 AF-S、AF-C 等對焦模式的差異與使用時機，並搭配實拍畫面說明如何在不同拍攝情境中選擇正確對焦方式。" }
                ]
            },
            {
                chapterId: ch1._id,
                title: "1-4 快門與動態模糊",
                concept: "快門特效",
                instructions: "拍攝兩張照片：一張高速快門凍結動作，一張慢速快門呈現動態模糊。",
                difficulty: 2,
                order: 4,
                resources: [
                    { type: 'article', title: "快門速度的影響 (Canon)", link: "https://snapshot.asia.canon/tw/zh-hant/article/camera-basics-2-shutter-speed", summary: "文章以清楚範例說明快門速度如何影響：動態凝結、動態模糊、低光環境拍攝，適合作為理解「速度感如何被記錄在照片中」的基礎教材。" },
                    { type: 'video', title: "動態模糊與快門速度教學 (藍染青)", link: "https://youtu.be/UxCNmtQE3Xs", summary: "影片以實拍方式比較不同快門速度下的畫面效果，幫助學習者建立對「慢快門 vs 高速快門」的視覺直覺。" }
                ]
            }
        ]);

        // 4. Create Tasks for Chapter 2
        const ch2 = chapters[2];
        await Task.insertMany([
            {
                chapterId: ch2._id,
                title: "2-1 三分法構圖",
                concept: "基礎構圖",
                instructions: "使用三分法拍攝一張人物或靜物照片，將主體置於交叉點上。",
                difficulty: 1,
                order: 1,
                resources: [
                    { type: 'article', title: "新手必學如何拍出好相片(3) – 基本構圖概念 (Fotobeginner)", link: "https://www.fotobeginner.com/16254/basic-photo-composition/", summary: "文章介紹最常見、也最適合新手入門的三分法構圖。將畫面想像成九宮格，主體放在四個交叉點之一，能讓畫面更自然、不呆板，並提升視覺平衡感。" },
                    { type: 'video', title: "三分鐘學會基本構圖 (VS MEDIA x Louis)", link: "https://youtu.be/5Xmx5pbnFQg", summary: "Louis 以快速、直觀的方式示範三分法構圖在生活拍攝中的實際應用，幫助學習者建立「看到畫面就知道主體該放哪裡」的構圖直覺。" }
                ]
            },
            {
                chapterId: ch2._id,
                title: "2-2 引導線構圖",
                concept: "視線引導",
                instructions: "尋找一條明顯的引導線（道路、樓梯、欄杆）拍攝一張照片，引導視線至主體。",
                difficulty: 2,
                order: 2,
                resources: [
                    { type: 'article', title: "如何使用引導線來拍攝出色的照片？ (Lomography)", link: "https://www.lomography.tw/school/fa-rlma44lm", summary: "文章說明如何利用環境中的線條（道路、圍欄、橋樑、光影等）作為引導線，將觀者視線自然地帶向主體，並增加畫面的空間感與故事性。" },
                    { type: 'video', title: "基礎構圖篇 Part 1 (CKTV)", link: "https://www.youtube.com/watch?v=GKCRQMLi3N8", summary: "影片透過實際照片解析引導線的運用方式，示範如何利用前景與線條方向，讓畫面更有深度與敘事性，是構圖觀念建立的重要教學影片。" }
                ]
            },
            {
                chapterId: ch2._id,
                title: "2-3 對稱與平衡",
                concept: "畫面平衡",
                instructions: "拍攝一張對稱構圖的畫面（如建築物正面或水面倒影），展現秩序與和諧。",
                difficulty: 2,
                order: 3,
                resources: [
                    { type: 'article', title: "基本構圖技巧(3)：中心構圖、對稱構圖 (Canon SNAPSHOT)", link: "https://snapshot.asia.canon/tw/zh-hant/article/part-3-composition-basics-center-composition-and-symmetrical-composition", summary: "文章介紹中心構圖與對稱構圖的差異與應用情境。中心構圖能強調主體並帶來穩定感；對稱構圖則常見於建築與倒影畫面，能營造秩序、和諧與平衡的視覺效果。" },
                    { type: 'video', title: "Balance in Cinematography – Symmetry and Asymmetry (Daniel Grindrod)", link: "https://youtube.com/shorts/XRrNzD7XKVU", summary: "短影片以視覺示例說明對稱與非對稱構圖的心理感受差異，幫助學習者理解「平衡不一定等於對稱」，而是畫面元素之間的視覺重量分配。" }
                ]
            },
            {
                chapterId: ch2._id,
                title: "2-4 畫面留白與主體突出",
                concept: "負空間應用",
                instructions: "嘗試一張大量留白的照片，讓主體只佔畫面一小部分，營造呼吸感。",
                difficulty: 3,
                order: 4,
                resources: [
                    { type: 'article', title: "自然攝影中的負空間 (Canon SNAPSHOT)", link: "https://snapshot.asia.canon/tw/zh-hant/article/negative-space-in-nature-photography", summary: "文章說明負空間（留白）在攝影中的重要性。透過簡化背景、保留大量空白，可以讓主體更突出，同時營造情緒、孤獨感或寧靜感，使畫面更有呼吸感。" },
                    { type: 'video', title: "手機拍照技巧：負空間–5 大重點 (Blue Lake)", link: "https://www.youtube.com/watch?v=06qP-Q6CnBg", summary: "影片以手機攝影為例，說明負空間構圖的五大實用原則，包含背景選擇、主體位置與畫面比例，讓學習者能立即應用在日常拍攝中。" }
                ]
            }
        ]);

        // 5. Create Tasks for Chapter 3
        const ch3 = chapters[3];
        await Task.insertMany([
            {
                chapterId: ch3._id,
                title: "3-1 順光、側光、逆光",
                concept: "光線方向",
                instructions: "同一主體分別在順光、側光、逆光下拍攝三張照片，比較立體感。",
                difficulty: 2,
                order: 1,
                resources: [
                    { type: 'article', title: "親子攝影的採光：順光、側光、逆光 (Alexworks)", link: "https://www.alexworksphoto.com/lighting-front-side-back/", summary: "文章完整說明三種常見自然光方向的特性：順光細節清楚但平淡；側光強化陰影與立體感；逆光適合營造剪影與戲劇效果。" },
                    { type: 'video', title: "Best Light Direction for Photography (Rick McEvoy)", link: "https://youtu.be/TkxXU4XJ7ac", summary: "Rick McEvoy 以實地拍攝示範三種光線方向對人物與景物立體感的影響，強調攝影師只要「移動位置」就能改變光線效果，是建立光線觀察力的實用教學。" }
                ]
            },
            {
                chapterId: ch3._id,
                title: "3-2 室內光源與色溫",
                concept: "色溫影響",
                instructions: "在室內混合光源下，觀察不同燈光對照片色彩的影響。",
                difficulty: 2,
                order: 2,
                resources: [
                    { type: 'article', title: "色溫動手調，影像更豐富 (OKAPI)", link: "https://okapi.books.com.tw/article/501", summary: "文章介紹色溫（Kelvin）的基本概念，說明白熾燈、日光燈、自然光的色溫差異，並解釋為什麼畫面會偏黃或偏藍，幫助學習者理解室內拍攝常見的色偏問題。" },
                    { type: 'video', title: "White Balance & Kelvin Color Temp Explained (LensProToGo)", link: "https://youtu.be/48c02L_nHZc", summary: "影片清楚說明 Kelvin 色溫與白平衡的關係，並示範在不同光源下調整白平衡的效果，幫助學習者理解為什麼「同一個場景換燈就會變色」。" }
                ]
            },
            {
                chapterId: ch3._id,
                title: "3-3 自訂白平衡設定",
                concept: "白平衡校正",
                instructions: "使用白紙或灰卡設定自訂白平衡，並與 AWB 拍攝結果比較。",
                difficulty: 3,
                order: 3,
                resources: [
                    { type: 'article', title: "Understanding White Balance (Photography Life)", link: "https://photographylife.com/understanding-white-balance", summary: "文章說明自動白平衡（AWB）與手動／自訂白平衡的差異，並介紹如何使用白平衡預設與灰卡，在拍攝當下取得準確色彩，是進階拍攝與後製的重要基礎。" },
                    { type: 'video', title: "How to Set Custom White Balance (Think Media)", link: "https://youtu.be/LN8PPLGBZSI", summary: "影片實際示範如何使用灰卡設定自訂白平衡，說明操作流程與注意事項，幫助學習者避免因環境光混雜而產生的色偏問題。" }
                ]
            },
            {
                chapterId: ch3._id,
                title: "3-4 利用光線創造情緒",
                concept: "光影氛圍",
                instructions: "選擇一種情緒（例如孤寂或戲劇感），刻意用光線完成拍攝。",
                difficulty: 3,
                order: 4,
                resources: [
                    { type: 'article', title: "用燈光創造 10 種心情效果 (杰客森林)", link: "https://jacksonlin.net/20180502-10種燈光氣氛效果/", summary: "文章分析光線方向、強弱與色彩如何影響畫面情緒，並以實例說明如何透過背光、側光、彩色光源與高反差配置，營造恐怖、孤獨、復古或戲劇化氛圍。" },
                    { type: 'video', title: "Creating Dark and Moody Lighting (PPA)", link: "https://www.youtube.com/watch?v=Laf-vFlYWPw", summary: "影片示範如何在白天利用控光與人造光源，創造暗調、戲劇性的畫面風格，適合理解「情緒不是靠後製，而是先從打光開始」。" }
                ]
            }
        ]);


        // 6. Create Tasks for Chapter 4 (Color, was 6)
        const ch4 = chapters[4];
        await Task.insertMany([
            {
                chapterId: ch4._id,
                title: "4-1 色彩心理學與視覺印象",
                concept: "色彩心理",
                instructions: "對同一場景或主體，透過白平衡或光源選擇，分別拍攝一張暖色調（溫馨）與一張冷色調（冷靜）的照片，觀察色彩如何建立第一印象。",
                difficulty: 3,
                order: 1,
                resources: [
                    { type: 'video', title: "通过颜色建立第一印象 (Youtube)", link: "https://youtu.be/OXv_67i8UR4?si=fPCdvCjY76J9HX24", summary: "影片說明色彩如何在極短時間內影響觀者的心理判斷與情緒感受，比主體更早被感知。" }
                ]
            },
            {
                chapterId: ch4._id,
                title: "4-2 互補色對比",
                concept: "色彩衝擊",
                instructions: "尋找畫面中具有互補色關係（如紅/綠、藍/橘、黃/紫）的場景拍攝，利用色彩對比凸顯主體。",
                difficulty: 3,
                order: 2,
                resources: [
                    { type: 'article', title: "攝影色彩學：互補色 (Digiphoto)", link: "https://digiphoto.techbang.com/posts/1468-photography-color-match", summary: "文章解釋色環上的互補色關係，說明強烈對比色能產生視覺衝擊，吸引觀者目光，常應用於商業攝影與電影調色。" }
                ]
            },
            {
                chapterId: ch4._id,
                title: "4-3 情境光色調控",
                concept: "情境光運用",
                instructions: "對同一主體使用不同顏色的光線（如濾色片、手機螢幕光或不同色溫燈光），拍攝出由背景顏色主導的對比情緒（例如：溫暖 vs 孤寂）。",
                difficulty: 4,
                order: 3,
                resources: [
                    { type: 'article', title: "【拍攝教學】閃光燈下的色彩藝術 (Lomography)", link: "https://www.lomography.tw/magazine/336968-the-art-of-colorsplashing-tw", summary: "介紹如何透過閃光燈搭配色片（Color Gel）改變光線顏色，創造戲劇化的畫面情緒與主體分離。" },
                    { type: 'video', title: "攝影師如何拍出不同顏色的背景 (詹姆斯)", link: "https://youtu.be/Hl3-ajQIivc?si=-Qn9EXmK-P7CSTkJ", summary: "示範如何透過燈光配置與背景材質控制，在拍攝當下設計背景顏色與情緒，而非依賴後製。" }
                ]
            },
        ]);

        // 7. Create Tasks for Chapter 5 (Portrait, was 4)
        const ch5 = chapters[5];
        await Task.insertMany([
            {
                chapterId: ch5._id,
                title: "5-1 人像光線與柔光",
                concept: "人像用光",
                instructions: "拍攝正面光與側光各一張人像。嘗試利用反射光或遮蔽創造柔光效果。",
                difficulty: 2,
                order: 1,
                resources: [
                    { type: 'article', title: "攝影光線與拍攝技巧 (Zach Photography)", link: "https://zachphotography.com/lighting-techniques/", summary: "文章說明人像拍攝中常見的光線方向對人物立體感的影響，並特別強調「柔光」的重要性，指出陰天、窗邊散射光或利用反射牆面都能讓光線更柔和。" },
                    { type: 'video', title: "硬光與柔光怎麼分？打燈小教室柔光篇", link: "https://youtu.be/wlCnPc4VgPg?si=PTl0M-k1vwPHs6rt", summary: "影片清楚比較硬光與柔光的差異，並實際示範柔光如何讓人像膚質更自然。即使在自然光環境下，也能透過遮擋、反射或改變拍攝角度，創造接近棚拍的柔光效果。" }
                ]
            },
            {
                chapterId: ch5._id,
                title: "5-2 人像構圖與場景",
                concept: "場景選擇",
                instructions: "選擇一個乾淨、有層次的背景，拍攝一張人像，注意背景不要干擾主體。",
                difficulty: 2,
                order: 2,
                resources: [
                    { type: 'article', title: "人像攝影課技巧複習 3－選景 (Kevin Wang)", link: "https://kevinimage.com/portrait-location/", summary: "文章分享選擇人像場景的思考流程：尋找大色塊背景、簡化畫面干擾、利用線條與層次增加畫面深度，以及觀察現場光線方向。" },
                    { type: 'video', title: "攝影師教你呈現電影式旅拍！(VS MEDIA × Louis)", link: "https://www.youtube.com/watch?v=QE33cE0y6NQ", summary: "Louis 透過實拍示範如何選擇乾淨、有層次的背景，並運用三分法、前景與留白，讓人像畫面更有電影感。" }
                ]
            },
            {
                chapterId: ch5._id,
                title: "5-3 姿勢引導與表情",
                concept: "引導技巧",
                instructions: "引導被攝者完成至少三個不同姿勢與表情，嘗試捕捉自然瞬間。",
                difficulty: 3,
                order: 3,
                resources: [
                    { type: 'article', title: "Capturing Better Portraits Between Poses (DPS)", link: "https://digital-photography-school.com/capturing-better-portraits-between-poses/", summary: "文章指出好的人像往往出現在「姿勢之間」，攝影師應透過聊天與互動，讓自然表情出現。" },
                    { type: 'video', title: "5 Easy Tips to Pose People Who Aren’t Models (B&H)", link: "https://www.youtube.com/watch?v=yr74CtwKoEk", summary: "影片提供 5 個實用技巧，教你如何引導非模特兒拍照，包括身體角度微調、手部擺放，以及用聊天方式捕捉自然表情。" }
                ]
            },
            {
                chapterId: ch5._id,
                title: "5-4 聚焦與景深選擇",
                concept: "景深控制",
                instructions: "使用不同光圈拍攝同一人物，比較淺景深（背景模糊）與深景深的效果。",
                difficulty: 3,
                order: 4,
                resources: [
                    { type: 'article', title: "如何拍出淺景深 (Fotobeginner)", link: "https://www.fotobeginner.com/14702/101-photography-tips-for-beginners/", summary: "文章整理影響景深的關鍵因素：光圈大小、拍攝距離、焦段與背景距離，建議對焦在眼睛上，並避免背景過於接近主體。" },
                    { type: 'video', title: "所以說，淺景深怎麼了嗎？", link: "https://www.youtube.com/watch?v=ChlwMDbVjGU&t=188s", summary: "影片從觀念層面重新思考「淺景深是否一定比較好」，說明景深應依畫面需求選擇，透過實例比較不同景深對人像氛圍與故事感的影響。" }
                ]
            }
        ]);

        // 8. Create Tasks for Chapter 6 (Street, was 5)
        const ch6 = chapters[6];
        await Task.insertMany([
            {
                chapterId: ch6._id,
                title: "6-1 找出畫面故事性",
                concept: "瞬間、關係與情緒",
                instructions: "尋找有敘事性的前景與背景，透過光線營造戲劇效果，耐心等待人物進入畫面。",
                difficulty: 3,
                order: 1,
                resources: [
                    { type: 'article', title: "手机街拍缺乏故事感？试试这4个超实用小技巧", link: "https://www.wenxiaobai.com/api/expends/detail?article=46e22af4-ad6e-49c5-90af-633ac372962c", summary: "文章以布列松提出的「決定性瞬間」為核心，說明街拍故事感來自於瞬間、關係與情緒，而非單一主體。提出四個實用技巧：1. 保持高度專注，隨時準備按下快門；2. 尋找有敘事性的前景與背景；3. 善用光線營造戲劇效果；4. 耐心等待人物進入畫面形成故事。適合建立「先看懂畫面，再拍」的街拍思維。" },
                    { type: 'video', title: "攝影教學：街拍沒想法？街頭故事感提升的4個觀念", link: "https://www.youtube.com/watch?v=jUX9YLKZJtY", summary: "影片以實拍案例說明如何在街頭建立故事感，重點在於「環境先行、人物後進」。講解如何觀察光影、背景與行人互動，並透過等待與預判，讓畫面自然產生敘事性，而非追著人拍。" }
                ]
            },
            {
                chapterId: ch6._id,
                title: "6-2 快速構圖與預判時機",
                concept: "預判與節奏",
                instructions: "提前構圖、等待人物進入畫面，利用幾何線條簡化畫面。",
                difficulty: 4,
                order: 2,
                resources: [
                    { type: 'article', title: "精彩相片拍攝教學（3）－街頭斑馬線如何拍？ (Fotobeginner)", link: "https://www.fotobeginner.com/25604/photo-tutorial-3-street-photography/", summary: "文章以斑馬線為例，說明街拍中如何提前構圖、等待人物進入畫面。包含：利用幾何線條簡化畫面、先決定構圖位置再等人、使用快門速度捕捉動作節奏、預判行人方向，提高成功率。非常適合練習「快而不亂」的街拍節奏。" },
                    { type: 'video', title: "街拍要領大公開！一支影片帶你攻略街頭攝影基本功（上）", link: "https://www.youtube.com/watch?v=WccdMYk7mdE", summary: "Kevin Wang 說明街拍前應先設定好曝光與對焦，並選定拍攝位置，等待畫面成立。強調「構圖在前、快門在後」，以及觀察人流與動線的重要性，是建立街拍預判能力的入門影片。" }
                ]
            },
            {
                chapterId: ch6._id,
                title: "6-3 觀察街景與人群互動",
                concept: "觀看與理解",
                instructions: "放慢腳步、觀察空間、光影與人群關係，建立屬於自己的街拍節奏。",
                difficulty: 4,
                order: 3,
                resources: [
                    { type: 'article', title: "街拍攝影的第一課，不是拍，是「看」 (OM Art Studio)", link: "https://www.omartstudio.com.tw/post/【街拍攝影的第一課，不是拍，是「看」】-1", summary: "文章強調街拍的本質是「觀看與理解」，而非連續快門。透過放慢腳步、觀察空間、光影與人群關係，訓練對街景節奏的敏感度，讓拍攝行為建立在理解之上。" },
                    { type: 'video', title: "【攝影小教室】我的六種街拍進行方式｜ft. Artlist – 我都 ok 呀", link: "https://www.youtube.com/watch?v=ydbarewRdZA", summary: "影片分享六種實際街拍進行方式，包括定點等待、邊走邊拍、利用反射與遮擋、觀察人群互動等。重點在於建立屬於自己的街拍節奏，並學會如何在不干擾他人的情況下捕捉真實互動。" }
                ]
            },
            {
                chapterId: ch6._id,
                title: "6-4 街拍倫理與距離感",
                concept: "倫理與尊重",
                instructions: "了解法律允許與倫理適當的界線，拍攝時保持同理心，避免剝削。",
                difficulty: 3,
                order: 4,
                resources: [
                    { type: 'article', title: "The Law and Ethics of Street Photography", link: "https://www.dostreetphotography.com/blog/law-and-ethics", summary: "文章清楚區分「法律允許」與「倫理是否適當」。重點包含：各國法律不同，需自行了解拍攝所在地規範；合法不等於合理，倫理來自攝影師自身判斷；遇到拍攝對象反對時，尊重比堅持作品更重要；可透過剪影、背影、遮擋等方式降低辨識性。" },
                    { type: 'video', title: "Street Photography Ethics: Why Your Photos Might Be Exploitative", link: "https://www.youtube.com/watch?v=38EK1lDOB0U", summary: "影片深入探討街拍可能涉及的剝削問題，提醒攝影師避免獵奇、避免拍攝弱勢者作為素材。強調「沒有一張照片值得讓別人不舒服」，建立以同理心為核心的街拍倫理觀。" }
                ]
            }
        ]);

        // 9. Create Tasks for Chapter 7
        const ch7 = chapters[7];
        await Task.insertMany([
            {
                chapterId: ch7._id,
                title: "7-1 自然光食物攝影",
                concept: "光線運用",
                instructions: "利用窗邊自然光拍攝食物，定位光線方向（如側光或逆光），透過控制光線形狀和位置，展現食物的色彩與質感。",
                difficulty: 3,
                order: 1,
                resources: [
                    { type: 'article', title: "How to Use Natural Light for Food Photography", link: "https://fotophile.com/how-to-use-natural-light-for-food-photography-a-practical-guide-for-photographers/", summary: "介紹自然光在食物攝影中的應用技巧，說明如何定位光線方向、利用窗戶光或側光打造誘人質感。" },
                    { type: 'video', title: "FOOD PHOTOGRAPHY NATURAL LIGHTING TIPS", link: "https://www.youtube.com/watch?v=MW6IW2ygWHg", summary: "示範如何善用自然光（尤其側光與窗邊光）拍攝食物照片，避免直射強光造成過曝或硬陰影。" }
                ]
            },
            {
                chapterId: ch7._id,
                title: "7-2 靜物構圖",
                concept: "構圖技巧",
                instructions: "運用三分法、引導線或負空間技巧拍攝食物靜物，透過道具和角度強化主體，提升影像吸引力。",
                difficulty: 3,
                order: 2,
                resources: [
                    { type: 'article', title: "10 Essential Food Photography Composition Techniques", link: "https://expertphotography.com/food-photography-composition/", summary: "整理食物攝影中最重要的構圖技巧，如三分法、引導線、負空間運用等。" },
                    { type: 'video', title: "5 Composition Tips EVERY food photographer needs", link: "https://www.youtube.com/watch?v=gq-lw3cfTTg", summary: "分享5個食物攝影構圖技巧，運用視覺引導和層次來提升畫面質感。" }
                ]
            },
            {
                chapterId: ch7._id,
                title: "7-3 食物攝影質感與細節",
                concept: "質感與細節",
                instructions: "運用光線與角度呈現食物的豐富層次與細節質感，注意背景與道具的搭配，營造視覺氛圍。",
                difficulty: 4,
                order: 3,
                resources: [
                    { type: 'article', title: "食物攝影有什麼技巧？9大構圖教學", link: "https://www.virllage.com/articles/foodphotography", summary: "列出九大拍攝技巧，包括光線運用、角度選擇、背景與道具搭配、景深管理與質感呈現。" },
                    { type: 'video', title: "Composition Techniques for Food Photography", link: "https://www.youtube.com/watch?v=-ex097pA7Kg", summary: "分享多種食物攝影構圖與視覺安排技巧，提升作品質感與敘事能力。" }
                ]
            }
        ]);

        // 10. Create Tasks for Chapter 8 (Portfolio, was 7 - Swap)
        const ch8 = chapters[8];
        await Task.insertMany([
            {
                chapterId: ch8._id,
                title: "8-1 如何挑選代表作品",
                concept: "作品挑選",
                instructions: "從大量作品中挑出最具代表性、品質高、色調一致且能展示風格的照片，作為作品集的基礎。",
                difficulty: 3,
                order: 1,
                resources: [
                    { type: 'article', title: "11 Photography Portfolio Tips for Impressing People", link: "https://expertphotography.com/create-a-photography-portfolio/", summary: "提供作品集挑選技巧，提醒作品集應精簡而有力，讓每張照片都有存在的理由。" },
                    { type: 'video', title: "Photography Portfolio Tips — How to Select Your Best Photos", link: "https://www.youtube.com/watch?v=Q6zUlOYJ0l8", summary: "示範如何先過濾曝光問題與重複畫面，再以主體表現與情緒影響力精選作品。" }
                ]
            },
            {
                chapterId: ch8._id,
                title: "8-2 整理與歸類照片",
                concept: "照片管理",
                instructions: "利用分類、標記與批量編輯工具（如 Lightroom）整理照片，建立系統化且易於檢索的作品資料庫。",
                difficulty: 3,
                order: 2,
                resources: [
                    { type: 'article', title: "照片太多怎麼整理？", link: "https://www.isuperman.tw/%E7%85%A7%E7%89%87%E5%A4%AA%E5%A4%9A%E6%80%8E%E9%BA%BC%E6%95%B4%E7%90%86%EF%BC%9F/", summary: "說明藉由分類、標記與批量編輯等工具，讓照片保存與管理更有效率。" },
                    { type: 'video', title: "Lightroom照片整理技巧教學", link: "https://www.youtube.com/watch?v=8tLLFdY7_tg", summary: "實際示範利用 Lightroom 的標記、旗標與集集功能來快速整理大量照片。" }
                ]
            },
            {
                chapterId: ch8._id,
                title: "8-3 風格回顧與語言建立",
                concept: "風格建立",
                instructions: "挑選能夠反映你個人人格與視覺面貌的作品，並以一致的視覺風格與主題，描述你的攝影個人特色。",
                difficulty: 4,
                order: 3,
                resources: [
                    { type: 'article', title: "How to Curate and Organize Your Photo Portfolio", link: "https://www.needpix.com/blog/how-to-curate-and-organize-your-photo-portfolio-to-showcase-your-best-work/", summary: "強調整理作品時要以「一致的視覺風格與主題」去描述你的攝影特色。" },
                    { type: 'video', title: "如何用作品集顯示你的攝影風格", link: "https://www.youtube.com/watch?v=YXRPR3y-tKw", summary: "說明如何透過作品集建立自己的攝影語言，並分析複數作品之間如何互相呼應。" }
                ]
            },
            {
                chapterId: ch8._id,
                title: "8-4 線上作品牆建立與分享",
                concept: "作品展示",
                instructions: "選擇適合的線上平台建立作品牆，發表本月代表作，並撰寫簡短的風格描述。",
                difficulty: 4,
                order: 4,
                resources: [
                    { type: 'article', title: "新手攝影師如何建立自己的作品集? 6個好用平台介紹", link: "https://evanpmba.com/%E6%96%B0%E6%89%8B%E6%94%9D%E5%BD%B1%E5%B8%AB%E5%A6%82%E4%BD%95%E5%BB%BA%E7%AB%8B%E8%87%AA%E5%B7%B1%E7%9A%84%E4%BD%9C%E5%93%81%E9%9B%86-6%E5%80%8B%E5%A5%BD%E7%94%A8%E5%B9%B3%E5%8F%B0%E4%BB%8B%E7%B4%B9/", summary: "介紹 Behance、Flickr 等線上平台，幫助建立線上作品牆。" },
                    { type: 'video', title: "Photography Portfolio Websites – Best Platforms", link: "https://www.youtube.com/watch?v=m-jhzA1sxHc", summary: "介紹不同的攝影作品集網站優缺點，示範如何快速建立線上作品牆。" }
                ]
            }
        ]);

        console.log('✅ Tasks Seeded for all 8 Chapters');
        console.log('🎉 Database Initialization Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
