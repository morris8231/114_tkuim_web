// 簡易前端表單驗證與 API 串接
const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const viewListBtn = document.getElementById('viewListBtn');
const signupList = document.getElementById('signupList');

// 驗證欄位並回傳錯誤訊息（若有）
function validateField(input, errorEl) {
  errorEl.textContent = '';
  // 原生驗證
  if (!input.checkValidity()) {
    if (input.validity.valueMissing) {
      errorEl.textContent = '此欄位必填';
    } else if (input.validity.typeMismatch) {
      errorEl.textContent = '格式錯誤';
    } else if (input.validity.tooShort) {
      errorEl.textContent = `至少 ${input.minLength} 字`;
    }
    return false;
  }
  return true;
}

// 即時驗證
['input', 'blur', 'change'].forEach(evt => {
  form.addEventListener(evt, (e) => {
    const { id } = e.target;
    if (!id) return;
    const errorEl = document.getElementById(`${id}Error`);
    if (errorEl) validateField(e.target, errorEl);
  });
});

// 防止重複送出
function setLoading(state) {
  if (state) {
    submitBtn.disabled = true;
    form.classList.add('loading');
  } else {
    submitBtn.disabled = false;
    form.classList.remove('loading');
  }
}

// 表單送出
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // 驗證所有欄位
  const nameValid = validateField(form.name, document.getElementById('nameError'));
  const emailValid = validateField(form.email, document.getElementById('emailError'));
  const passwordValid = validateField(form.password, document.getElementById('passwordError'));
  if (!nameValid || !emailValid || !passwordValid) {
    return;
  }
  // 串接 API
  setLoading(true);
  try {
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim()
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`報名失敗：${data.message || '未知錯誤'}`);
    } else {
      alert('報名成功！');
      form.reset();
    }
  } catch (err) {
    alert('無法連接伺服器');
  } finally {
    setLoading(false);
  }
});

// 查看報名清單
viewListBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/signup');
    const data = await res.json();
    signupList.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    signupList.textContent = '取得報名清單失敗';
  }
});
