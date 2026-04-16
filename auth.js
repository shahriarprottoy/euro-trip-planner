// auth.js
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    
    // In a real app, you'd check a database. 
    // Here, we save the username to LocalStorage to "remember" them.
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', user);
    
    // Redirect to the main planner page
    window.location.href = 'planner.html';
});

// Security Check: If a user tries to access planner.html without logging in
if (window.location.pathname.includes('planner.html')) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    }
}
