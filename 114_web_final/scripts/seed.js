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
        const chapters = await Chapter.insertMany([
            {
                title: "主題 0：起步與設定",
                description: "工欲善其事，必先利其器",
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
                title: "主題 4：色彩與風格",
                description: "情緒的傳達",
                order: 4,
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
                title: "主題 5：街拍與紀實",
                description: "捕捉真實的瞬間",
                order: 5,
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
                title: "主題 6：人像攝影",
                description: "與人的互動與拍攝",
                order: 6,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=t5Op1Dg1Y0E",
                resources: {
                    videos: [
                        { title: "Natural Light Portrait Photography Tips", link: "https://www.youtube.com/results?search_query=Natural+Light+Portrait+Photography+Tips+Adorama", description: "Adorama TV / B&H Photo 自然光人像拍攝技巧。" }
                    ],
                    articles: [
                        { title: "人像攝影自然光教學 (Tim Ting / 哈鏡頭)", link: "https://www.google.com/search?q=%E4%BA%BA%E5%83%8F%E6%94%9D%E5%BD%B1+%E8%87%AA%E7%84%B6%E5%85%89+%E6%95%99%E5%AD%B8+Tim+Ting", description: "自然光人像拍攝技巧分享。" }
                    ]
                }
            },
            {
                title: "主題 7：個人創作與作品集",
                description: "發展你的攝影風格",
                order: 7,
                unlockRule: { requiredTasks: 3 },
                youtubeLink: "https://www.youtube.com/watch?v=cjBve1qwCmA",
                resources: {
                    videos: [
                        { title: "How to Develop a Photo Series", link: "https://www.youtube.com/results?search_query=How+to+Develop+a+Photo+Series", description: "如何構思與發展系列攝影作品。" },
                        { title: "Building Your Photography Portfolio", link: "https://www.youtube.com/results?search_query=Building+Your+Photography+Portfolio", description: "建立個人攝影作品集的建議。" }
                    ],
                    articles: [
                        { title: "Fstoppers / DPS Photo Series Ideas", link: "https://digital-photography-school.com/8-ideas-create-photo-series/", description: "英文文章談如何構思系列作品。" }
                    ]
                }
            },
            {
                title: "主題 8：食物與靜物",
                description: "生活中的靜謐之美",
                order: 8,
                unlockRule: { requiredTasks: 3 },
                resources: {
                    videos: [
                        { title: "Shooting Still Life Photography for Beginners!", link: "https://www.youtube.com/watch?v=tgymaO3ZEXc", description: "針對靜物 / 產品照片拍攝技巧入門教學。" }
                    ],
                    articles: [
                        { title: "攝影教學大補帖", link: "https://aihowlive.com/%E5%A6%82%E4%BD%95%E9%80%B2%E8%A1%8C%E6%94%9D%E5%BD%B1%E6%95%99%E5%AD%B8/", description: "涵蓋多種拍攝題材技巧（含靜物/光線/編排）。" }
                    ]
                }
            }
        ]);
        console.log(`✅ Created ${chapters.length} Chapters`);

        // 2. Create Tasks for Chapter 0
        const ch0 = chapters[0];
        await Task.insertMany([
            { chapterId: ch0._id, title: "握持與穩定", concept: "穩定的相機是清晰照片的基礎", instructions: "請上傳 3 張使用不同支撐方式（手持夾緊、依託牆壁、使用腳架/桌面）拍攝的照片。", difficulty: 1, order: 1 },
            { chapterId: ch0._id, title: "了解你的鏡頭", concept: "廣角 vs 長焦", instructions: "站在同一位置，分別用最廣角端與最望遠端拍攝同一主體，觀察透視變化。", difficulty: 1, order: 2 },
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

        // 6. Create Tasks for Chapter 4
        const ch4 = chapters[4];
        await Task.insertMany([
            { chapterId: ch4._id, title: "色彩情緒", concept: "冷暖色調", instructions: "拍攝兩組照片：一組以暖色調為主，一組以冷色調為主，表達不同情緒。", difficulty: 3, order: 1, tutorialLink: "https://lenslesson.com/beginner-photography/art-of-color-theory-photography/", refLink: "https://www.imagely.com/color-theory-photography-and-design/" },
            { chapterId: ch4._id, title: "白平衡實驗", concept: "色溫控制", instructions: "同一場景使用不同白平衡設定（日光、陰天、鎢絲燈等）拍攝，觀察差異。", difficulty: 2, order: 2, tutorialLink: "https://lenslesson.com/beginner-photography/art-of-color-theory-photography/" },
            { chapterId: ch4._id, title: "黑白攝影", concept: "去除色彩的干擾", instructions: "拍攝黑白照片，專注於光影、質感和形狀的表現。", difficulty: 3, order: 3, refLink: "https://expertphotography.com/color-theory-landscape-photography/" },
        ]);

        // 7. Create Tasks for Chapter 5
        const ch5 = chapters[5];
        await Task.insertMany([
            { chapterId: ch5._id, title: "捕捉瞬間", concept: "街頭攝影", instructions: "在街頭拍攝有趣的瞬間或人物互動，保持自然真實。", difficulty: 4, order: 1, tutorialLink: "https://expertphotography.com/how-to-select-best-photos/", refLink: "https://digital-photography-school.com/8-tips-narrative-photography/" },
            { chapterId: ch5._id, title: "環境人像", concept: "人與環境", instructions: "拍攝人物與其環境的關係，講述一個故事。", difficulty: 4, order: 2, refLink: "https://digital-photography-school.com/8-tips-narrative-photography/" },
            { chapterId: ch5._id, title: "細節觀察", concept: "微距與特寫", instructions: "拍攝日常生活中被忽略的細節（紋理、圖案、小物件等）。", difficulty: 3, order: 3 },
        ]);

        // 8. Create Tasks for Chapter 6
        const ch6 = chapters[6];
        await Task.insertMany([
            { chapterId: ch6._id, title: "自然光人像", concept: "窗光運用", instructions: "使用窗戶光線拍攝人像，表現柔和的光影過渡。", difficulty: 3, order: 1, tutorialLink: "https://photographylife.com/portrait-photography-tips", refLink: "https://digital-photography-school.com/use-natural-window-light-portraits/" },
            { chapterId: ch6._id, title: "情緒捕捉", concept: "表情與姿態", instructions: "拍攝展現不同情緒的人像（快樂、沉思、專注等）。", difficulty: 4, order: 2, tutorialLink: "https://1on1.today/blog/%E3%80%90%E6%94%9D%E5%BD%B1%E5%85%A5%E9%96%80%E3%80%91%E6%94%9D%E5%BD%B1%E5%A4%A7%E5%B8%AB%E7%9A%84%E4%BA%BA%E5%83%8F%E6%94%9D%E5%BD%B1%E6%95%99%E5%AD%B8/" },
            { chapterId: ch6._id, title: "環境肖像", concept: "背景與主體", instructions: "將人物放在有意義的環境中，背景要能補充主體的故事。", difficulty: 4, order: 3, refLink: "https://photographylife.com/portrait-photography-tips" },
        ]);

        // 9. Create Tasks for Chapter 7
        const ch7 = chapters[7];
        await Task.insertMany([
            { chapterId: ch7._id, title: "主題系列創作", concept: "系列思維", instructions: "選擇一個主題（如「城市角落」、「光影」等），拍攝至少 5 張相關聯的照片。", difficulty: 5, order: 1, tutorialLink: "https://photographylife.com/landscape-photography-tips", refLink: "https://www.schubertphotography.com/landscape-photography-for-beginners/" },
            { chapterId: ch7._id, title: "個人風格探索", concept: "找到你的聲音", instructions: "回顧之前的作品，找出你喜歡的元素，創作 3 張體現個人風格的照片。", difficulty: 5, order: 2, tutorialLink: "https://expertphotography.com/cityscape-photography-tips/" },
            { chapterId: ch7._id, title: "最終作品集", concept: "綜合運用", instructions: "精選 8-10 張最佳作品，組成一個有主題的作品集，展現你的學習成果。", difficulty: 5, order: 3, refLink: "https://aihowlive.com/%E5%A6%82%E4%BD%95%E9%80%B2%E8%A1%8C%E6%94%9D%E5%BD%B1%E6%95%99%E5%AD%B8/" },
        ]);

        // 10. Create Tasks for Chapter 8
        const ch8 = chapters[8];
        await Task.insertMany([
            { chapterId: ch8._id, title: "自然光食物攝影", concept: "光線運用", instructions: "利用窗邊自然光拍攝食物，嘗試侧光或逆光拍攝，展現食物質感。", difficulty: 3, order: 1, tutorialLink: "https://www.youtube.com/watch?v=tgymaO3ZEXc" },
            { chapterId: ch8._id, title: "靜物構圖", concept: "擺盤與構圖", instructions: "練習不同的構圖方式（如平拍、45度角、俯拍）拍攝靜物組合。", difficulty: 3, order: 2, refLink: "https://aihowlive.com/%E5%A6%82%E4%BD%95%E9%80%B2%E8%A1%8C%E6%94%9D%E5%BD%B1%E6%95%99%E5%AD%B8/" },
            { chapterId: ch8._id, title: "質感與細節", concept: "微距與光影", instructions: "近距離拍攝物品的質感與細節，利用光影凸顯立體感。", difficulty: 4, order: 3 }
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
