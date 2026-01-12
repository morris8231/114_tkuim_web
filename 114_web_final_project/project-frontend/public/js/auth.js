const API_BASE_URL = 'http://localhost:8080/api/auth';

async function register(email, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || '註冊失敗');
        }
        return true; // Success
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
}

async function login(email, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            throw new Error('登入失敗，請檢查帳號密碼');
        }

        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            return data.token;
        } else {
            throw new Error('未收到登入憑證');
        }
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
    return token;
}
