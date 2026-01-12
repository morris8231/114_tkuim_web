function renderNavbar() {
    const token = localStorage.getItem('token');
    const nav = document.createElement('nav');
    nav.className = 'navbar';

    nav.innerHTML = `
        <div class="nav-container">
            <a href="index.html" class="nav-logo">☕ 找到你的咖啡</a>
            <ul class="nav-links">
                <li><a href="index.html">首頁</a></li>
                <li><a href="cafes.html">探索地圖</a></li>
                ${token
            ? `<li><a href="#" onclick="logoutUser()">登出</a></li>`
            : `<li><a href="login.html" class="btn-login">登入</a></li>`
        }
            </ul>
        </div>
    `;

    // Insert navbar at the top of the body
    document.body.insertBefore(nav, document.body.firstChild);
}

function logoutUser() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Render Navbar immediately
document.addEventListener('DOMContentLoaded', renderNavbar);
