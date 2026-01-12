// 小工具：同時把訊息顯示在頁面與 Console
function show(msg, level = "log") {
  const box = document.getElementById("message");
  if (box) box.textContent = msg;
  (console[level] || console.log)(msg);
}

// DOM 就緒後再綁定事件，避免抓不到元素
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("myButton");
  const input = document.getElementById("nameInput");
  const demo = document.getElementById("demo");

  console.log("%c頁面載入完成", "font-weight:bold;");

  // 按鈕：點擊後更新訊息 + 段落
  btn?.addEventListener("click", () => {
    const name = (input?.value || "").trim() || "同學";
    show(`哈囉，${name}！按鈕被點擊囉～`);
    if (demo) demo.textContent = `Hi, ${name}! 這段文字被 JavaScript 改過了。`;
  });

  // 輸入框：即時偵測輸入
  input?.addEventListener("input", (e) => {
    console.debug("目前輸入：", e.target.value);
  });
});
