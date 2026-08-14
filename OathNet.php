<?php
/**
 * OathNet API PHP Client Class
 * Supports V1 & V2 OathNet Endpoints, Search Sessions, Stealer & Breach Intel, OSINT Lookups
 */

require_once __DIR__ . '/config.php';

class OathNet {
    private string $apiKey;
    private string $baseUrl;

    public function __construct(?string $apiKey = null, ?string $baseUrl = null) {
        $this->apiKey = $apiKey ?? OATHNET_API_KEY;
        $this->baseUrl = $baseUrl ?? OATHNET_BASE_URL;
    }

    /**
     * Set active API key dynamically
     */
    public function setApiKey(string $apiKey): void {
        $this->apiKey = $apiKey;
    }

    /**
     * Main cURL request helper
     */
    public function request(string $endpoint, string $method = 'GET', array $params = [], ?array $body = []): array {
        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');

        if ($method === 'GET' && !empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        // API Key MUST be lowercase header 'x-api-key'
        $headers = [
            'x-api-key: ' . $this->apiKey,
            'Accept: application/json'
        ];

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($body)) {
                $headers[] = 'Content-Type: application/json';
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            }
        } elseif ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            return [
                'success' => false,
                'message' => 'cURL Error: ' . $curlError,
                'http_code' => $httpCode
            ];
        }

        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'success' => false,
                'message' => 'Invalid JSON Response',
                'raw' => $response,
                'http_code' => $httpCode
            ];
        }

        $decoded['http_code'] = $httpCode;
        return $decoded;
    }

    /**
     * Initialize Search Session
     */
    public function initSearchSession(string $query, string $type = 'email'): array {
        return $this->request('/service/search/init', 'POST', [], [
            'query' => $query,
            'search_type' => $type
        ]);
    }

    /**
     * Search Breach Records
     */
    public function searchBreach(string $query, ?string $cursor = null, ?string $searchId = null, ?string $dbnames = null): array {
        $params = ['q' => $query];
        if ($cursor) $params['cursor'] = $cursor;
        if ($searchId) $params['search_id'] = $searchId;
        if ($dbnames) $params['dbnames'] = $dbnames;

        return $this->request('/service/search-breach', 'GET', $params);
    }

    /**
     * V2 Breach Search (Advanced JSON / Flat)
     */
    public function searchBreachV2(string $query, ?string $cursor = null, ?string $searchId = null, ?array $filter = null): array {
        $params = ['q' => $query];
        if ($cursor) $params['cursor'] = $cursor;
        if ($searchId) $params['search_id'] = $searchId;

        if ($filter) {
            return $this->request('/service/v2/breach/search', 'POST', $params, ['filter' => $filter]);
        }
        return $this->request('/service/v2/breach/search', 'GET', $params);
    }

    /**
     * Search Stealer Records (Original)
     */
    public function searchStealer(string $query, ?string $cursor = null, ?string $searchId = null): array {
        $params = ['q' => $query];
        if ($cursor) $params['cursor'] = $cursor;
        if ($searchId) $params['search_id'] = $searchId;

        return $this->request('/service/search-stealer', 'GET', $params);
    }

    /**
     * V2 Stealer Search (Enhanced)
     */
    public function searchStealerV2(string $query, ?string $cursor = null, ?string $searchId = null, ?string $view = null, ?array $filter = null): array {
        $params = ['q' => $query];
        if ($cursor) $params['cursor'] = $cursor;
        if ($searchId) $params['search_id'] = $searchId;
        if ($view) $params['view'] = $view;

        if ($filter) {
            return $this->request('/service/v2/stealer/search', 'POST', $params, ['filter' => $filter]);
        }
        return $this->request('/service/v2/stealer/search', 'GET', $params);
    }

    /**
     * Fetch up to $targetCount stealer records via cursor pagination
     */
    public function searchStealerV2MultiPage(string $query, ?string $searchId = null, int $targetCount = 2000, ?array $filter = null): array {
        $allItems = [];
        $cursor = null;
        $lastMeta = null;
        $maxPages = (int) ceil($targetCount / 500);
        $page = 0;

        while (count($allItems) < $targetCount && $page < $maxPages) {
            $page++;
            $res = $this->searchStealerV2($query, $cursor, $searchId, null, $filter);
            if (empty($res['success']) && empty($res['data'])) {
                break;
            }

            $items = $res['data']['items'] ?? $res['data']['results'] ?? [];
            if (empty($items)) {
                break;
            }

            $allItems = array_merge($allItems, $items);
            $lastMeta = $res['data']['meta'] ?? null;

            $nextCursor = $res['data']['next_cursor'] ?? $res['data']['nextCursorMark'] ?? null;
            $hasMore = $res['data']['meta']['has_more'] ?? false;

            if (!$nextCursor || !$hasMore) {
                break;
            }
            $cursor = $nextCursor;
        }

        return [
            'success' => true,
            'data' => [
                'items' => array_slice($allItems, 0, $targetCount),
                'meta' => $lastMeta,
                'next_cursor' => $cursor
            ]
        ];
    }

    /**
     * Extract Subdomains for a domain
     */
    public function extractSubdomains(string $domain, bool $alive = false): array {
        return $this->request('/service/v2/stealer/subdomain', 'GET', [
            'domain' => $domain,
            'alive' => $alive ? 'true' : 'false'
        ]);
    }

    /**
     * Search Victim Profiles
     */
    public function searchVictims(string $query, ?string $cursor = null): array {
        $params = ['q' => $query];
        if ($cursor) $params['cursor'] = $cursor;
        return $this->request('/service/v2/victims/search', 'GET', $params);
    }

    /**
     * Get Victim Summary
     */
    public function getVictimSummary(string $logId, ?string $searchId = null): array {
        $params = [];
        if ($searchId) $params['search_id'] = $searchId;
        return $this->request('/service/v2/victims/' . urlencode($logId) . '/summary', 'GET', $params);
    }

    /**
     * Get Victim File Tree Manifest (CORRECT endpoint: /service/v2/victims/{log_id})
     * Returns: log_id, victim_tree (tree of directories/files with id, name, type, size_bytes, children)
     */
    public function getVictimManifest(string $logId, ?string $searchId = null): array {
        $params = [];
        if ($searchId) $params['search_id'] = $searchId;
        return $this->request('/service/v2/victims/' . urlencode($logId), 'GET', $params);
    }

    /**
     * Get Victim File Content by file_id
     */
    public function getVictimFileContent(string $logId, string $fileId, ?string $searchId = null): array {
        $params = [];
        if ($searchId) $params['search_id'] = $searchId;
        return $this->request('/service/v2/victims/' . urlencode($logId) . '/files/' . urlencode($fileId), 'GET', $params);
    }

    /**
     * OSINT Lookups
     */
    public function osintDiscordUser(string $discordId): array {
        return $this->request('/service/osint/discord/user', 'GET', ['id' => $discordId]);
    }

    public function osintDiscordHistory(string $discordId): array {
        return $this->request('/service/osint/discord/history', 'GET', ['id' => $discordId]);
    }

    public function osintEmailCheck(string $email): array {
        return $this->request('/service/osint/email/check', 'GET', ['email' => $email]);
    }

    public function osintGoogleInfo(string $email): array {
        return $this->request('/service/osint/google/info', 'GET', ['email' => $email]);
    }

    public function osintIpInfo(string $ip): array {
        return $this->request('/service/osint/ip/info', 'GET', ['ip' => $ip]);
    }

    public function osintRobloxUser(string $user): array {
        return $this->request('/service/osint/roblox/user', 'GET', ['user' => $user]);
    }

    public function osintSteamProfile(string $id): array {
        return $this->request('/service/osint/steam/profile', 'GET', ['id' => $id]);
    }

    public function osintXboxProfile(string $id): array {
        return $this->request('/service/osint/xbox/profile', 'GET', ['id' => $id]);
    }

    /**
     * Get Phonebook Domain & Email Intelligence
     */
    public function getPhonebook(string $domain, ?string $searchId = null, bool $alive = false): array {
        $params = ['domain' => $domain];
        if ($searchId) $params['search_id'] = $searchId;
        if ($alive) $params['alive'] = 'true';
        return $this->request('/service/v2/phonebook', 'GET', $params);
    }

    /**
     * List Automated Scanners
     */
    public function listScanners(): array {
        return $this->request('/service/scanners', 'GET');
    }
}
