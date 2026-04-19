// Simple Login Check
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', document.getElementById('username').value);
        window.location.href = 'planner.html';
    });
}

// Protect Planner Page
if (window.location.pathname.includes('planner.html')) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    } else {
        document.getElementById('user-display').innerText = localStorage.getItem('userName');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
