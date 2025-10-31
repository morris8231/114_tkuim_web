// 會員註冊表單驗證（沿用你的範例結構與寫法）

// ---- DOM 取得 ----
const form = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const pageAlert = document.getElementById('page-alert');

const nameInput = document.getElementById('name');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPwd = document.getElementById('confirm');
const interestsWrap = document.getElementById('interests');
const interestsGuard = document.getElementById('interests-guard');
const tos = document.getElementById('tos');

// 錯誤輸出元素（aria-describedby 指向這些 <p>）
const errMap = {
  name: document.getElementById('name-error'),
  email: document.getElementById('email-error'),
  phone: document.getElementById('phone-error'),
  password: document.getElementById('password-error'),
  confirm: document.getElementById('confirm-error'),
  interests: document.getElementById('interests-error'),
  tos: document.getElementById('tos-error'),
};

// 強度條
const strengthBar = document.getElementById('password-strength-bar');
const strengthText = document.getElementById('password-strength-text');

// ---- 工具：寫入錯誤訊息到對應 <p>（與 example2 的 reportValidity 節奏一致）----
function setErrorText(input, msg) {
  const key = input.id === 'interests-guard' ? 'interests' : input.id;
  const p = errMap[key];
  if (p) p.textContent = msg || '';
}

// ---- 核心驗證（沿用 example2：setCustomValidity + reportValidity）----
function showValidity(input) {
  input.setCustomValidity(''); // 先清空

  if (input.validity.valueMissing) {
    input.setCustomValidity('這個欄位必填');
  } else if (input.validity.typeMismatch) {
    input.setCustomValidity('格式不正確，請確認輸入內容');
  } else if (input.validity.patternMismatch) {
    input.setCustomValidity(input.title || '格式不正確');
  }

  // 額外規則：密碼/確認密碼/興趣至少 1 個
  if (input === password) {
    const hasLetter = /[A-Za-z]/.test(password.value);
    const hasDigit = /\d/.test(password.value);
    if (password.value.length < 8) {
      input.setCustomValidity('密碼需至少 8 碼');
    } else if (!(hasLetter && hasDigit)) {
      input.setCustomValidity('密碼需包含英文字母與數字');
    }
  }
  if (input === confirmPwd) {
    if (confirmPwd.value !== password.value) {
      input.setCustomValidity('兩次輸入的密碼不一致');
    }
  }
  if (input === interestsGuard) {
    if (getInterestsCheckedCount() === 0) {
      input.setCustomValidity('請至少選擇 1 個興趣');
    }
  }

  setErrorText(input, input.validationMessage);
  return input.reportValidity();
}

// ---- 興趣（事件委派，沿用 example1 的父層監聽模式）----
function getInterestsCheckedCount() {
  return interestsWrap.querySelectorAll('input[type="checkbox"]:checked').length;
}
function refreshInterestsValidity() {
  showValidity(interestsGuard);
}
interestsWrap.addEventListener('click', (event) => {
  const label = event.target.closest('.chip');
  if (!label) return;
  const checkbox = label.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  label.classList.toggle('active', checkbox.checked);
  refreshInterestsValidity();
  saveCache();
});

// ---- 密碼強度（加分；不改動驗證結構，只在 input 時更新視覺）----
function evalStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (!pw) return { level: 'none', label: '—' };
  if (score <= 2) return { level: 'weak', label: '弱' };
  if (score === 3 || score === 4) return { level: 'medium', label: '中' };
  return { level: 'strong', label: '強' };
}
function renderStrength(pw) {
  const { level, label } = evalStrength(pw);
  strengthBar.classList.remove('weak', 'medium', 'strong');
  if (level === 'weak') strengthBar.classList.add('weak');
  if (level === 'medium') strengthBar.classList.add('medium');
  if (level === 'strong') strengthBar.classList.add('strong');
  strengthText.textContent = `強度：${label}`;
}

// ---- localStorage 暫存（加分；示範用途）----
const LS_KEY = 'signup_form_cache_v1';
function saveCache() {
  const data = {
    name: nameInput.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    confirm: confirmPwd.value,
    interests: Array.from(interestsWrap.querySelectorAll('input[type="checkbox"]'))
      .filter(c => c.checked)
      .map(c => c.value),
    tos: tos.checked,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadCache() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    nameInput.value = data.name || '';
    email.value = data.email || '';
    phone.value = data.phone || '';
    password.value = data.password || '';
    confirmPwd.value = data.confirm || '';
    Array.from(interestsWrap.querySelectorAll('input[type="checkbox"]')).forEach(c => {
      c.checked = (data.interests || []).includes(c.value);
      c.closest('.chip')?.classList.toggle('active', c.checked);
    });
    tos.checked = !!data.tos;
    renderStrength(password.value);
  } catch {}
}
function clearCache() {
  localStorage.removeItem(LS_KEY);
}

// ---- touched 集（沿用 example3：只在使用者操作後顯示錯誤）----
const touched = new Set();
function handleBlur(e) {
  touched.add(e.target.id);
  showValidity(e.target === interestsWrap ? interestsGuard : e.target);
}
function handleInput(e) {
  if (!touched.has(e.target.id)) return;
  showValidity(e.target);
}

// ---- 事件繫結（沿用 example2/3/4 的 blur/input/submit 流程）----
nameInput.addEventListener('blur', handleBlur);
email.addEventListener('blur', handleBlur);
phone.addEventListener('blur', handleBlur);
password.addEventListener('blur', (e) => {
  handleBlur(e);
  // 同步確認欄位（若已操作過）
  if (touched.has('confirm')) showValidity(confirmPwd);
});
confirmPwd.addEventListener('blur', handleBlur);
tos.addEventListener('blur', handleBlur);

[nameInput, email, phone].forEach((el) => {
  el.addEventListener('input', (e) => { handleInput(e); saveCache(); });
});
password.addEventListener('input', (e) => {
  renderStrength(password.value);
  handleInput(e);
  if (touched.has('confirm')) showValidity(confirmPwd);
  saveCache();
});
confirmPwd.addEventListener('input', (e) => { handleInput(e); saveCache(); });
tos.addEventListener('change', () => { showValidity(tos); saveCache(); });

// ---- 送出攔截 + 防重送（沿用 example5 的節奏）----
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // 先把密碼/確認標記為已操作（確保會顯示訊息）
  touched.add('password');
  touched.add('confirm');

  // 逐欄位檢查（維持 showValidity/聚焦第一個錯誤的模式）
  const okName = showValidity(nameInput);
  const okEmail = showValidity(email);
  const okPhone = showValidity(phone);
  const okPwd = showValidity(password);
  const okConfirm = showValidity(confirmPwd);
  const okInterests = showValidity(interestsGuard);
  const okTos = showValidity(tos);

  if (!(okName && okEmail && okPhone && okPwd && okConfirm && okInterests && okTos)) {
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // 防重送
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  // 模擬送出 1 秒
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 成功提示
  showPageAlert('success', '註冊成功！資料已送出。');

  // 清空並復原
  form.reset();
  Array.from(interestsWrap.querySelectorAll('.chip')).forEach(ch => ch.classList.remove('active'));
  renderStrength('');
  Object.values(errMap).forEach(p => (p.textContent = ''));
  clearCache();
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

// ---- 重設按鈕（沿用 example5：reset + 清錯 + 邏輯復原）----
resetBtn.addEventListener('click', () => {
  form.reset();
  Array.from(interestsWrap.querySelectorAll('.chip')).forEach(ch => ch.classList.remove('active'));
  renderStrength('');
  Object.values(errMap).forEach(p => (p.textContent = ''));
  clearCache();
  showPageAlert('info', '表單已重設。');
});

// ---- 啟動：載入暫存、初始化強度條 ----
document.addEventListener('DOMContentLoaded', () => {
  loadCache();
  renderStrength(password.value);
});

// ---- 小工具 ----
function showPageAlert(type, text) {
  pageAlert.className = '';
  pageAlert.classList.add('alert', `alert-${type}`);
  pageAlert.textContent = text;
  pageAlert.classList.remove('d-none');
}
