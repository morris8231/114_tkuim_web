function getToken() {
  return localStorage.getItem('token');
}
function showUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInfo = document.getElementById('userInfo');
  if (user && user.email) {
    userInfo.textContent = `已登入：${user.email}（${user.role}）`;
  } else {
    userInfo.textContent = '未登入';
  }
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const errorEl = document.getElementById('formError');
  errorEl.textContent = '';
  const token = getToken();
  if (!token) {
    errorEl.textContent = '請先登入';
    return;
  }
  try {
    const res = await fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name, email, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return;
      }
      errorEl.textContent = data.message || '送出失敗';
      return;
    }
    document.getElementById('signupForm').reset();
    loadList();
  } catch (err) {
    errorEl.textContent = '無法連接伺服器';
  }
});

async function loadList() {
  const token = getToken();
  if (!token) {
    document.getElementById('list').textContent = '請先登入';
    return;
  }
  try {
    const res = await fetch('http://localhost:3001/api/signup', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return;
      }
      document.getElementById('list').textContent = data.message || '讀取失敗';
      return;
    }
    const listDiv = document.getElementById('list');
    if (!data.participants || data.participants.length === 0) {
      listDiv.textContent = '沒有資料';
      return;
    }
    listDiv.innerHTML = '';
    data.participants.forEach(item => {
      const div = document.createElement('div');
      div.textContent = `${item.name} - ${item.email} - ${item.phone}`;
      const btn = document.createElement('button');
      btn.textContent = '刪除';
      btn.addEventListener('click', () => deleteItem(item._id || item.id));
      div.appendChild(btn);
      listDiv.appendChild(div);
    });
  } catch (err) {
    document.getElementById('list').textContent = '無法連接伺服器';
  }
}

async function deleteItem(id) {
  const token = getToken();
  if (!token) {
    alert('請先登入');
    return;
  }
  if (!confirm('確定要刪除這筆資料嗎？')) return;
  try {
    const res = await fetch('http://localhost:3001/api/signup/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (res.status === 401) {
      logout();
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || '刪除失敗');
    }
    loadList();
  } catch (err) {
    alert('無法連接伺服器');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showUserInfo();
  loadList();
});
