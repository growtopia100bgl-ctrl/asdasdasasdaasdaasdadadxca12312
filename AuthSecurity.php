<?php
/**
 * OathFlix - God-Tier AuthSecurity & Admin Management Core
 * Features: Anti-VPN/Proxy Detection, 1 Account Per IP Lock, 5 Free Credits Quota, Super Admin Panel
 */

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Strict');
    session_start();
}

require_once __DIR__ . '/config.php';

header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

class AuthSecurity {
    private PDO $db;

    public function __construct() {
        $dbPath = __DIR__ . '/oathflix_sec.sqlite';
        $this->db = new PDO('sqlite:' . $dbPath);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->initDb();
        $this->seedAdmin();
        $this->checkIpProtection();
    }

    private function initDb(): void {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                credits INTEGER DEFAULT 5,
                is_unlimited INTEGER DEFAULT 0,
                registered_ip TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS ip_logs (
                ip TEXT PRIMARY KEY,
                failed_attempts INTEGER DEFAULT 0,
                last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
                blocked_until DATETIME DEFAULT NULL
            );
        ");

        // Safely add missing columns if database table already existed
        $cols = [
            'credits' => "INTEGER DEFAULT 5",
            'is_unlimited' => "INTEGER DEFAULT 0",
            'registered_ip' => "TEXT"
        ];
        foreach ($cols as $col => $type) {
            try {
                $this->db->exec("ALTER TABLE users ADD COLUMN {$col} {$type}");
            } catch (Exception $e) {
                // Column already exists
            }
        }
    }

    /**
     * Seed Super Admin Account if not exists
     */
    private function seedAdmin(): void {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = 'admin'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $hash = password_hash('admin123456', PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("INSERT INTO users (username, email, password_hash, role, credits, is_unlimited, registered_ip) VALUES ('admin', 'admin@oathflix.local', :h, 'admin', 999999, 1, '127.0.0.1')");
            $stmt->execute([':h' => $hash]);
        }
    }

    /**
     * Get Client Real IP
     */
    public static function getClientIp(): string {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        }
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '127.0.0.1';
    }

    /**
     * Anti-VPN / Proxy Detection
     */
    public static function isVpnOrProxy(): bool {
        return false; // Disabled for InfinityFree proxy compatibility
        $headers = [
            'HTTP_VIA',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_FORWARDED',
            'HTTP_CLIENT_IP',
            'HTTP_FORWARDED_FOR_HEADER',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_PROXY_CONNECTION'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                // If header is set and not localhost loopback
                $val = $_SERVER[$header];
                if ($val !== '127.0.0.1' && $val !== '::1') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * IP Rate Limiting Check
     */
    private function checkIpProtection(): void {
        $ip = self::getClientIp();
        $stmt = $this->db->prepare("SELECT * FROM ip_logs WHERE ip = :ip");
        $stmt->execute([':ip' => $ip]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($record && !empty($record['blocked_until'])) {
            if (strtotime($record['blocked_until']) > time()) {
                http_response_code(429);
                die(json_encode([
                    'success' => false,
                    'message' => '🛡️ GOD-TIER LOCKOUT: Too many failed login attempts. IP blocked for 15 minutes.'
                ]));
            }
        }
    }

    private function recordFailedAttempt(): void {
        $ip = self::getClientIp();
        $stmt = $this->db->prepare("SELECT * FROM ip_logs WHERE ip = :ip");
        $stmt->execute([':ip' => $ip]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            $stmt = $this->db->prepare("INSERT INTO ip_logs (ip, failed_attempts, last_attempt) VALUES (:ip, 1, CURRENT_TIMESTAMP)");
            $stmt->execute([':ip' => $ip]);
        } else {
            $attempts = $record['failed_attempts'] + 1;
            $blockedUntil = ($attempts >= 5) ? date('Y-m-d H:i:s', time() + (15 * 60)) : null;
            $stmt = $this->db->prepare("UPDATE ip_logs SET failed_attempts = :attempts, last_attempt = CURRENT_TIMESTAMP, blocked_until = :blocked WHERE ip = :ip");
            $stmt->execute([':attempts' => $attempts, ':blocked' => $blockedUntil, ':ip' => $ip]);
        }
    }

    private function resetIpAttempts(): void {
        $ip = self::getClientIp();
        $stmt = $this->db->prepare("DELETE FROM ip_logs WHERE ip = :ip");
        $stmt->execute([':ip' => $ip]);
    }

    /**
     * Register User (1 Account per IP + Anti-VPN + 5 Free Credits)
     */
    public function registerUser(string $username, string $email, string $password): array {
        if (self::isVpnOrProxy()) {
            return ['success' => false, 'message' => '🚫 REGISTRATION BLOCKED: VPN/Proxy detected! Turn off VPN to register.'];
        }

        $ip = self::getClientIp();
        $username = trim(htmlspecialchars($username));
        $email = strtolower(trim($email));

        if (strlen($username) < 3) return ['success' => false, 'message' => 'Username must be at least 3 characters.'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return ['success' => false, 'message' => 'Invalid email address.'];
        if (strlen($password) < 6) return ['success' => false, 'message' => 'Password must be at least 6 characters.'];

        // Enforce 1 Account Per IP Rule
        $stmt = $this->db->prepare("SELECT id FROM users WHERE registered_ip = :ip");
        $stmt->execute([':ip' => $ip]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => '🚫 IP LIMIT EXCEEDED: Only 1 account is allowed per IP address!'];
        }

        // Check unique username/email
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = :u OR email = :e");
        $stmt->execute([':u' => $username, ':e' => $email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Username or Email is already taken!'];
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("INSERT INTO users (username, email, password_hash, role, credits, is_unlimited, registered_ip) VALUES (:u, :e, :h, 'user', 5, 0, :ip)");
        $stmt->execute([':u' => $username, ':e' => $email, ':h' => $hash, ':ip' => $ip]);

        return ['success' => true, 'message' => 'Registration successful! You have 5 free search credits. Please sign in.'];
    }

    /**
     * Login User
     */
    public function loginUser(string $login, string $password): array {
        if (self::isVpnOrProxy()) {
            return ['success' => false, 'message' => '🚫 LOGIN BLOCKED: VPN/Proxy detected! Disable VPN to login.'];
        }

        $login = trim($login);
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :l OR email = :l");
        $stmt->execute([':l' => $login]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->recordFailedAttempt();
            return ['success' => false, 'message' => 'Invalid credentials!'];
        }

        $this->resetIpAttempts();

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['credits'] = $user['credits'];
        $_SESSION['is_unlimited'] = $user['is_unlimited'];

        return ['success' => true, 'message' => 'Login successful!', 'role' => $user['role']];
    }

    /**
     * Deduct Credits per Search
     */
    public function consumeSearchCredit(int $amount = 1): array {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) return ['success' => false, 'message' => 'Unauthorized'];
        
        $action = $_REQUEST['action'] ?? 'UNKNOWN_ACTION';
        $uri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN_URI';
        file_put_contents(__DIR__ . '/credit_debug.log', "[" . date('H:i:s') . "] ACTION: $action | URI: $uri | DBG: " . json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)) . "\n", FILE_APPEND);

        $stmt = $this->db->prepare("SELECT credits, is_unlimited FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) return ['success' => false, 'message' => 'User not found'];

        if ($user['is_unlimited'] == 1) {
            return ['success' => true, 'remaining' => 'UNLIMITED'];
        }

        if ($user['credits'] < $amount) {
            return ['success' => false, 'message' => '🚫 SEARCH QUOTA EXHAUSTED: You do not have enough credits. Cost: ' . $amount];
        }

        $newCredits = $user['credits'] - $amount;
        $stmt = $this->db->prepare("UPDATE users SET credits = :c WHERE id = :id");
        $stmt->execute([':c' => $newCredits, ':id' => $userId]);

        $_SESSION['credits'] = $newCredits;
        return ['success' => true, 'remaining' => $newCredits];
    }

    public static function isLoggedIn(): bool {
        return !empty($_SESSION['user_id']);
    }

    public static function isAdmin(): bool {
        return self::isLoggedIn() && ($_SESSION['role'] ?? '') === 'admin';
    }

    public static function requireLogin(): void {
        if (!self::isLoggedIn()) {
            header('Location: login.php');
            exit;
        }
    }

    public static function requireAdmin(): void {
        self::requireLogin();
        if (!self::isAdmin()) {
            header('Location: index.php');
            exit;
        }
    }

    public function getAllUsers(): array {
        $stmt = $this->db->query("SELECT id, username, email, role, credits, is_unlimited, registered_ip, created_at FROM users ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateUserCredits(int $userId, int $credits, int $isUnlimited): bool {
        $stmt = $this->db->prepare("UPDATE users SET credits = :c, is_unlimited = :u WHERE id = :id");
        return $stmt->execute([':c' => $credits, ':u' => $isUnlimited, ':id' => $userId]);
    }
}
