<?php
/**
 * OathFlix - Super Admin Panel (Netflix High-Security Theme)
 */
require_once __DIR__ . '/AuthSecurity.php';

$auth = new AuthSecurity();
AuthSecurity::requireAdmin();

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_credits') {
        $userId = intval($_POST['user_id'] ?? 0);
        $credits = intval($_POST['credits'] ?? 0);
        $isUnlimited = isset($_POST['is_unlimited']) ? 1 : 0;
        
        if ($auth->updateUserCredits($userId, $credits, $isUnlimited)) {
            $msg = '✅ User credits updated successfully!';
        } else {
            $msg = '❌ Failed to update user credits.';
        }
    }
}

$users = $auth->getAllUsers();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OathFlix - Super Admin Panel</title>
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .admin-container {
      padding: 100px 4% 60px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--nf-border);
      padding-bottom: 20px;
    }
    .admin-title {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 35px;
    }
    .stat-card {
      background: rgba(24, 24, 24, 0.85);
      border: 1px solid var(--nf-border);
      border-radius: 12px;
      padding: 22px;
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .stat-icon {
      font-size: 2.2rem;
      color: var(--nf-red);
    }
    .stat-val {
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
    }
    .stat-lbl {
      color: var(--nf-gray-muted);
      font-size: 0.85rem;
    }
    .user-table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(24, 24, 24, 0.85);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--nf-border);
    }
    .user-table th, .user-table td {
      padding: 16px 20px;
      text-align: left;
      border-bottom: 1px solid var(--nf-border);
    }
    .user-table th {
      background: rgba(0, 0, 0, 0.5);
      color: var(--nf-gray-light);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .user-table td {
      font-size: 0.95rem;
      color: #fff;
    }
    .badge-role {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-admin { background: var(--nf-red); color: #fff; }
    .badge-user { background: #333; color: var(--nf-gray-light); }
    .badge-unlimited { background: #2e7d32; color: #fff; }
    
    .form-inline {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .input-credits {
      width: 80px;
      height: 36px;
      background: #000;
      border: 1px solid var(--nf-border);
      border-radius: 6px;
      color: #fff;
      padding: 0 10px;
      text-align: center;
    }
    .btn-save {
      height: 36px;
      padding: 0 16px;
      background: var(--nf-red);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <!-- Navbar Header -->
  <header class="nf-navbar">
    <div class="nav-left">
      <a href="index.php" class="nf-brand">
        <span class="nf-logo-text">OATHFLIX</span>
      </a>
      <span class="badge-role badge-admin">ADMIN CONTROL CENTER</span>
    </div>
    <div class="nav-right">
      <a href="index.php" style="color: var(--nf-gray-light); text-decoration: none; margin-right: 20px;">
        <i class="fa-solid fa-house"></i> Main Dashboard
      </a>
      <a href="logout.php" style="color: var(--nf-red); text-decoration: none;">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </a>
    </div>
  </header>

  <div class="admin-container">
    <div class="admin-header">
      <h1 class="admin-title">
        <i class="fa-solid fa-user-shield" style="color: var(--nf-red);"></i> Super Admin User & Quota Management
      </h1>
    </div>

    <?php if ($msg): ?>
      <div style="background: rgba(46, 125, 50, 0.2); border: 1px solid #2e7d32; color: #fff; padding: 14px; border-radius: 8px; margin-bottom: 25px;">
        <?php echo $msg; ?>
      </div>
    <?php endif; ?>

    <!-- Stats Bar -->
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fa-solid fa-users stat-icon"></i>
        <div>
          <div class="stat-val"><?php echo count($users); ?></div>
          <div class="stat-lbl">Total Registered Users</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="fa-solid fa-network-wired stat-icon"></i>
        <div>
          <div class="stat-val"><?php echo count(array_unique(array_column($users, 'registered_ip'))); ?></div>
          <div class="stat-lbl">Unique Registered IPs</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="fa-solid fa-crown stat-icon" style="color: #ffd700;"></i>
        <div>
          <div class="stat-val">
            <?php echo count(array_filter($users, fn($u) => $u['is_unlimited'] == 1)); ?>
          </div>
          <div class="stat-lbl">Unlimited Accounts</div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Registered IP</th>
          <th>Role</th>
          <th>Remaining Credits</th>
          <th>Manage Credits & Unlimited Access</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($users as $u): ?>
          <tr>
            <td>#<?php echo $u['id']; ?></td>
            <td><strong><?php echo htmlspecialchars($u['username']); ?></strong></td>
            <td><?php echo htmlspecialchars($u['email']); ?></td>
            <td><code><?php echo htmlspecialchars($u['registered_ip'] ?? '127.0.0.1'); ?></code></td>
            <td>
              <span class="badge-role <?php echo $u['role'] === 'admin' ? 'badge-admin' : 'badge-user'; ?>">
                <?php echo strtoupper($u['role']); ?>
              </span>
            </td>
            <td>
              <?php if ($u['is_unlimited']): ?>
                <span class="badge-role badge-unlimited">UNLIMITED ♾️</span>
              <?php else: ?>
                <strong style="color: var(--nf-red); font-size: 1.1rem;"><?php echo $u['credits']; ?> Credits</strong>
              <?php endif; ?>
            </td>
            <td>
              <form method="POST" class="form-inline">
                <input type="hidden" name="action" value="update_credits">
                <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                <input type="number" name="credits" class="input-credits" value="<?php echo $u['credits']; ?>" min="0">
                <label style="font-size: 0.85rem; cursor: pointer; color: var(--nf-gray-light);">
                  <input type="checkbox" name="is_unlimited" value="1" <?php echo $u['is_unlimited'] ? 'checked' : ''; ?>> Unlimited
                </label>
                <button type="submit" class="btn-save">Save</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

  </div>

  <script src="assets/js/netflix-canvas.js"></script>
</body>
</html>
