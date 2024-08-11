function login(e) {
    e.preventDefault();

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    };
    
    axios.post('http://3.26.200.238:3000/user/login', loginDetails)
        .then(response => {
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            window.location.href = "../ExpenseTracker/index.html";
        })
        .catch(err => {
            console.error('Login error:', err);
            document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
        });
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
}

function forgotPassword(e) {
    e.preventDefault();

    const email = e.target.email.value;

    axios.post('http://3.26.200.238:3000/user/forgot-password', { email })
        .then(response => {
            alert(response.data.message);
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('forgotPasswordForm').style.display = 'none';
        })
        .catch(err => {
            console.error('Forgot password error:', err);
            document.body.innerHTML += `<div style="color:red;">${err.response ? err.response.data.message : err.message}</div>`;
        });
}
