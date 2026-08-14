<?php
require_once __DIR__ . '/AuthSecurity.php';

$auth = new AuthSecurity();

// Redirect if already logged in
if (AuthSecurity::isLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Handle AJAX Login / Register POST requests
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    header('Content-Type: application/json');
    $action = $_POST['action'] ?? '';

    if ($action === 'register') {
        $res = $auth->registerUser($_POST['username'] ?? '', $_POST['email'] ?? '', $_POST['password'] ?? '');
        echo json_encode($res);
        exit;
    } elseif ($action === 'login') {
        $res = $auth->loginUser($_POST['login'] ?? '', $_POST['password'] ?? '');
        echo json_encode($res);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Netflix - Sign In / Sign Up</title>
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      z-index: 10;
    }
    .login-box {
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(20px);
      border: 1px solid var(--nf-border);
      border-radius: 12px;
      padding: 48px 56px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px var(--nf-red-glow);
    }
    .login-header {
      margin-bottom: 28px;
    }
    .login-title {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .form-group {
      margin-bottom: 18px;
      position: relative;
    }
    .form-input {
      width: 100%;
      height: 52px;
      background: #333;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 0 16px;
      color: #fff;
      font-size: 1rem;
      transition: var(--transition-smooth);
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      background: #444;
      border-color: #888;
    }
    .btn-auth {
      width: 100%;
      height: 52px;
      background: var(--nf-red);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 10px;
      transition: var(--transition-smooth);
      box-shadow: 0 4px 20px var(--nf-red-glow);
    }
    .btn-auth:hover {
      background: var(--nf-red-hover);
    }
    .auth-toggle {
      margin-top: 24px;
      color: var(--nf-gray-muted);
      font-size: 0.95rem;
    }
    .auth-toggle span {
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
    .auth-error {
      background: rgba(229, 9, 20, 0.2);
      border: 1px solid var(--nf-red);
      color: #fff;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.88rem;
      margin-bottom: 20px;
      display: none;
    }
  </style>
</head>
<body>

  <!-- Netflix Navbar Header -->
  <header class="nf-navbar" style="background: transparent;">
    <div class="nav-left">
      <a href="#" class="nf-brand">
        <span class="nf-logo-text">OATHFLIX</span>
      </a>
    </div>
  </header>

  <div class="login-container">
    <div class="login-box">
      
      <!-- SIGN IN FORM -->
      <div id="loginFormSection">
        <div class="login-header">
          <h2 class="login-title">Sign In</h2>
        </div>

        <div id="loginError" class="auth-error"></div>

        <form id="loginForm">
          <input type="hidden" name="action" value="login">
          <div class="form-group">
            <input type="text" name="login" class="form-input" placeholder="Email or Username" required autocomplete="username">
          </div>
          <div class="form-group">
            <input type="password" name="password" class="form-input" placeholder="Password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-auth">Sign In</button>
        </form>

        <div class="auth-toggle">
          New to OathFlix? <span id="showRegister">Sign up now.</span>
        </div>
      </div>

      <!-- SIGN UP FORM -->
      <div id="registerFormSection" style="display: none;">
        <div class="login-header">
          <h2 class="login-title">Sign Up</h2>
        </div>

        <div id="registerError" class="auth-error"></div>

        <form id="registerForm">
          <input type="hidden" name="action" value="register">
          <div class="form-group">
            <input type="text" name="username" class="form-input" placeholder="Username" required autocomplete="username">
          </div>
          <div class="form-group">
            <input type="email" name="email" class="form-input" placeholder="Email Address" required autocomplete="email">
          </div>
          <div class="form-group">
            <input type="password" name="password" class="form-input" placeholder="Password (min 6 chars)" required autocomplete="new-password">
          </div>
          <button type="submit" class="btn-auth">Register</button>
        </form>

        <div class="auth-toggle">
          Already have an account? <span id="showLogin">Sign in now.</span>
        </div>
      </div>

    </div>
  </div>

  <script src="assets/js/netflix-canvas.js"></script>
  <script>
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginFormSection = document.getElementById('loginFormSection');
    const registerFormSection = document.getElementById('registerFormSection');

    showRegister.addEventListener('click', () => {
      loginFormSection.style.display = 'none';
      registerFormSection.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
      registerFormSection.style.display = 'none';
      loginFormSection.style.display = 'block';
    });

    // Handle Login AJAX
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('loginError');
      errBox.style.display = 'none';

      const formData = new FormData(e.target);
      try {
        const res = await fetch('login.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          window.location.href = 'index.php';
        } else {
          errBox.textContent = data.message || 'Login failed';
          errBox.style.display = 'block';
        }
      } catch (err) {
        errBox.textContent = 'Server connection error';
        errBox.style.display = 'block';
      }
    });

    // Handle Register AJAX
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('registerError');
      errBox.style.display = 'none';

      const formData = new FormData(e.target);
      try {
        const res = await fetch('login.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Registration successful! Please sign in.');
          showLogin.click();
        } else {
          errBox.textContent = data.message || 'Registration failed';
          errBox.style.display = 'block';
        }
      } catch (err) {
        errBox.textContent = 'Server connection error';
        errBox.style.display = 'block';
      }
    });
  </script>
</body>
</html>
