// 等待 DOM 載入後執行
document.addEventListener('DOMContentLoaded', () => {
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  const fruitCardsContainer = document.getElementById('fruitCards');
  const fruitItems = document.querySelectorAll('.fruit-item');
  const contactForm = document.getElementById('contactForm');
  const successAlert = document.getElementById('formSuccess');
  const currentYearSpan = document.getElementById('currentYear');

  // 設定當前年份
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /**
   * 根據選擇的類別篩選水果卡片
   */
  function filterCards() {
    const selected = categoryFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();
    fruitItems.forEach(item => {
      const category = item.dataset.category;
      const title = item.querySelector('.card-title').textContent.toLowerCase();
      const description = item.querySelector('.card-text').textContent.toLowerCase();
      const matchesCategory = selected === 'all' || category === selected;
      const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
      if (matchesCategory && matchesSearch) {
        item.classList.remove('d-none');
      } else {
        item.classList.add('d-none');
      }
    });
  }

  // 篩選變動事件
  categoryFilter.addEventListener('change', filterCards);
  searchInput.addEventListener('input', filterCards);

  // 詳細內容折疊按鈕
  document.querySelectorAll('.toggle-detail').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // 切換 Bootstrap collapse 狀態：如果有 'show' 類別則隱藏，反之顯示
        targetEl.classList.toggle('show');
      }
    });
  });

  // 聯絡表單驗證與送出
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // 若表單驗證不通過
    if (!contactForm.checkValidity()) {
      contactForm.classList.add('was-validated');
      return;
    }
    // 送出成功，展示成功訊息
    successAlert.classList.remove('d-none');
    // 清除表單內容
    contactForm.reset();
    contactForm.classList.remove('was-validated');
    // 五秒後隱藏提示
    setTimeout(() => {
      successAlert.classList.add('d-none');
    }, 5000);
  });
});