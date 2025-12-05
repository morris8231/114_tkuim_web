// Client logic for Week11 CRUD operations
const apiBase = 'http://localhost:3001/api/signup';
const form = document.getElementById('participantForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const editingIdInput = document.getElementById('editingId');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const globalError = document.getElementById('globalError');
const tableBody = document.querySelector('#participantsTable tbody');

function clearErrors() {
  document.getElementById('nameError').textContent = '';
  document.getElementById('emailError').textContent = '';
  document.getElementById('phoneError').textContent = '';
  globalError.textContent = '';
}

function validateField(input, errorEl) {
  errorEl.textContent = '';
  if (!input.checkValidity()) {
    if (input.validity.valueMissing) {
      errorEl.textContent = '此欄位必填';
    } else if (input.validity.typeMismatch) {
      errorEl.textContent = '格式錯誤';
    } else if (input.validity.patternMismatch) {
      errorEl.textContent = '格式錯誤';
    } else if (input.validity.tooShort) {
      errorEl.textContent = `至少 ${input.minLength} 字`;
    }
    return false;
  }
  return true;
}

async function fetchParticipants() {
  try {
    const res = await fetch(`${apiBase}?page=1&limit=100`);
    const data = await res.json();
    renderTable(data.items || []);
  } catch (err) {
    globalError.textContent = '無法取得資料';
  }
}

function renderTable(participants) {
  tableBody.innerHTML = '';
  participants.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.email}</td>
      <td>${p.phone}</td>
      <td class="actions">
        <button data-id="${p._id}" class="edit-btn">編輯</button>
        <button data-id="${p._id}" class="delete-btn">刪除</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  const nameValid = validateField(nameInput, document.getElementById('nameError'));
  const emailValid = validateField(emailInput, document.getElementById('emailError'));
  const phoneValid = validateField(phoneInput, document.getElementById('phoneError'));
  if (!nameValid || !emailValid || !phoneValid) {
    return;
  }
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };
  try {
    if (editingIdInput.value) {
      // update existing
      const res = await fetch(`${apiBase}/${editingIdInput.value}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        globalError.textContent = data.message || '更新失敗';
        return;
      }
    } else {
      // create new
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        globalError.textContent = data.message || '建立失敗';
        return;
      }
    }
    // reset form and reload data
    form.reset();
    editingIdInput.value = '';
    submitBtn.textContent = '新增';
    cancelBtn.style.display = 'none';
    await fetchParticipants();
  } catch (err) {
    globalError.textContent = '無法連線到伺服器';
  }
});

// Cancel editing
cancelBtn.addEventListener('click', () => {
  form.reset();
  editingIdInput.value = '';
  submitBtn.textContent = '新增';
  cancelBtn.style.display = 'none';
  clearErrors();
});

// Delegate table clicks for edit/delete
tableBody.addEventListener('click', async (e) => {
  const target = e.target;
  if (target.classList.contains('edit-btn')) {
    const id = target.dataset.id;
    // fetch single participant from the list (already loaded)
    const row = target.closest('tr');
    nameInput.value = row.children[0].textContent;
    emailInput.value = row.children[1].textContent;
    phoneInput.value = row.children[2].textContent;
    editingIdInput.value = id;
    submitBtn.textContent = '更新';
    cancelBtn.style.display = 'inline';
  } else if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    if (!confirm('確認要刪除這筆資料嗎？')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        globalError.textContent = data.message || '刪除失敗';
        return;
      }
      await fetchParticipants();
    } catch (err) {
      globalError.textContent = '無法連線到伺服器';
    }
  }
});

// Load initial data
fetchParticipants();
