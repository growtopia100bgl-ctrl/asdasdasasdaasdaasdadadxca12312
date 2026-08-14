<?php
/**
 * Internal AJAX Handler for OathFlix Frontend
 * Routes frontend Automated & Manual OSINT requests to OathNet API securely.
 */

ob_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/OathNet.php';
require_once __DIR__ . '/AuthSecurity.php';

if (!AuthSecurity::isLoggedIn()) {
    http_response_code(401);
    die(json_encode(['success' => false, 'message' => '🛡️ Unauthorized: Authentication required.']));
}

$auth = new AuthSecurity();
$action = $_REQUEST['action'] ?? '';

// Exempt these from credit consumption - they're sub-calls within a search session
$creditExempt = ['list_scanners', 'get_victim_manifest', 'get_victim_summary', 'download_victim_archive', 'get_music_list', 'get_file_content'];
if (!in_array($action, $creditExempt)) {
    $quotaRes = $auth->consumeSearchCredit();
    if (!$quotaRes['success']) {
        http_response_code(403);
        die(json_encode($quotaRes));
    }
}
$customApiKey = $_REQUEST['api_key'] ?? '';

$oathnet = new OathNet(!empty($customApiKey) ? $customApiKey : null);

$response = [
    'success' => false,
    'message' => 'Invalid action'
];

try {
    switch ($action) {
        case 'automated_search':
            $query = trim($_REQUEST['query'] ?? '');
            if (empty($query)) throw new Exception('Search query is required');
            $searchId = trim($_REQUEST['search_id'] ?? '');
            $limit = isset($_REQUEST['limit']) ? intval($_REQUEST['limit']) : 2000;
            if ($limit <= 0 || $limit > 10000) $limit = 2000;

            if (empty($searchId)) {
                $sessionRes = $oathnet->initSearchSession($query);
                $searchId = $sessionRes['data']['session']['id'] ?? null;
            }

            $stealerRes = $oathnet->searchStealerV2MultiPage($query, $searchId, $limit);
            $breachRes = $oathnet->searchBreachV2($query, null, $searchId);
            $osintRes = null;

            if (filter_var($query, FILTER_VALIDATE_IP)) {
                $osintRes = $oathnet->osintIpInfo($query);
            } elseif (ctype_digit($query) && strlen($query) >= 17) {
                $osintRes = $oathnet->osintDiscordUser($query);
            }

            $stealerItems = $stealerRes['data']['items'] ?? $stealerRes['data']['results'] ?? [];
            $breachItems = $breachRes['data']['items'] ?? $breachRes['data']['results'] ?? [];
            $ips = [];
            $discordData = null;

            if ($osintRes && !empty($osintRes['data'])) {
                if (isset($osintRes['data']['id']) || isset($osintRes['data']['username'])) {
                    $discordData = $osintRes['data'];
                }
            }

            $response = [
                'success' => true,
                'message' => 'Automated intelligence search completed',
                'search_id' => $searchId,
                'data' => [
                    'results' => $stealerItems,
                    'stealer_logs' => $stealerItems,
                    'breaches' => $breachItems,
                    'ips' => $ips,
                    'discord' => $discordData
                ]
            ];
            break;

        case 'search_breach':
            $query = trim($_REQUEST['query'] ?? '');
            $cursor = $_REQUEST['cursor'] ?? null;
            if (empty($query)) throw new Exception('Search query is required');
            $response = $oathnet->searchBreachV2($query, $cursor);
            if (empty($response['data']['results']) && empty($response['data'])) {
                $response = $oathnet->searchBreach($query, $cursor);
            }
            break;

        case 'search_stealer':
            $query = trim($_REQUEST['query'] ?? '');
            $cursor = $_REQUEST['cursor'] ?? null;
            $searchId = trim($_REQUEST['search_id'] ?? '');
            $limit = isset($_REQUEST['limit']) ? intval($_REQUEST['limit']) : 2000;
            if ($limit <= 0 || $limit > 10000) $limit = 2000;
            $filterJson = $_REQUEST['filter'] ?? null;
            $filter = $filterJson ? json_decode($filterJson, true) : null;
            if (empty($query)) throw new Exception('Search query is required');

            if (empty($searchId) && empty($cursor)) {
                $sessionRes = $oathnet->initSearchSession($query);
                $searchId = $sessionRes['data']['session']['id'] ?? null;
            }

            // If a specific cursor is requested, fetch that single page, otherwise multi-page up to limit
            if (!empty($cursor)) {
                $response = $oathnet->searchStealerV2($query, $cursor, $searchId, null, $filter);
            } else {
                $response = $oathnet->searchStealerV2MultiPage($query, $searchId, $limit, $filter);
            }

            if (empty($response['data']['results']) && empty($response['data']['items'])) {
                $response = $oathnet->searchStealer($query, $cursor, $searchId);
            }
            if ($searchId) {
                $response['search_id'] = $searchId;
            }
            break;

        case 'master_profiler':
            $query = trim($_REQUEST['query'] ?? '');
            if (empty($query)) throw new Exception('Target query is required');
            
            // It already consumed 1 credit globally, so we don't need to deduct more
            
            $sessionRes = $oathnet->initSearchSession($query);
            $searchId = $sessionRes['data']['session']['id'] ?? null;
            
            $stealerRes = $oathnet->searchStealerV2($query, null, $searchId);
            $discordRes = ctype_digit($query) ? $oathnet->osintDiscordUser($query) : null;
            $steamRes = $oathnet->osintSteamProfile($query);
            $xboxRes = $oathnet->osintXboxProfile($query);
            $robloxRes = $oathnet->osintRobloxUser($query);
            
            $response = [
                'success' => true,
                'message' => 'Master Profiler completed successfully.',
                'search_id' => $searchId,
                'data' => [
                    'stealer' => $stealerRes['data']['items'] ?? $stealerRes['data']['results'] ?? [],
                    'discord' => $discordRes['data'] ?? null,
                    'steam' => $steamRes['data'] ?? null,
                    'xbox' => $xboxRes['data'] ?? null,
                    'roblox' => $robloxRes['data'] ?? null,
                ]
            ];
            break;

        case 'extract_subdomains':
            $domain = trim($_REQUEST['domain'] ?? '');
            if (empty($domain)) throw new Exception('Domain is required');
            $response = $oathnet->extractSubdomains($domain, true);
            break;

        case 'phonebook_search':
            $domain = trim($_REQUEST['domain'] ?? $_REQUEST['query'] ?? '');
            if (empty($domain)) throw new Exception('Domain is required');
            // Clean domain URL if user typed https://
            $domain = preg_replace('#^https?://#', '', $domain);
            $domain = rtrim(explode('/', $domain)[0], '/');
            
            $searchId = trim($_REQUEST['search_id'] ?? '');
            if (empty($searchId)) {
                $sessionRes = $oathnet->initSearchSession($domain, 'domain');
                $searchId = $sessionRes['data']['session']['id'] ?? null;
            }

            $phonebookRes = $oathnet->getPhonebook($domain, $searchId, true);
            $subdomainsRes = $oathnet->extractSubdomains($domain, true);

            $response = [
                'success' => true,
                'message' => 'Phonebook & Subdomain Intelligence retrieved',
                'search_id' => $searchId,
                'data' => [
                    'domain' => $domain,
                    'phonebook' => $phonebookRes,
                    'subdomains' => $subdomainsRes['data'] ?? $subdomainsRes
                ]
            ];
            break;

        case 'osint_lookup':
            $type = trim($_REQUEST['type'] ?? '');
            $target = trim($_REQUEST['target'] ?? '');
            if (empty($type) || empty($target)) throw new Exception('Type and target are required');

            switch ($type) {
                case 'discord_id':
                    $response = $oathnet->osintDiscordUser($target);
                    break;
                case 'discord_history':
                    $response = $oathnet->osintDiscordHistory($target);
                    break;
                case 'email_check':
                    $response = $oathnet->osintEmailCheck($target);
                    break;
                case 'google':
                    $response = $oathnet->osintGoogleInfo($target);
                    break;
                case 'ip':
                    $response = $oathnet->osintIpInfo($target);
                    break;
                case 'roblox':
                    $response = $oathnet->osintRobloxUser($target);
                    break;
                case 'steam':
                    $response = $oathnet->osintSteamProfile($target);
                    break;
                case 'xbox':
                    $response = $oathnet->osintXboxProfile($target);
                    break;
                default:
                    throw new Exception('Unsupported OSINT lookup type');
            }
            break;

        case 'get_victim_manifest':
            $logId = trim($_REQUEST['log_id'] ?? '');
            $searchId = trim($_REQUEST['search_id'] ?? '');
            if (empty($logId)) throw new Exception('log_id is required');
            // Correct endpoint: GET /service/v2/victims/{log_id} returns victim_tree
            $raw = $oathnet->getVictimManifest($logId, $searchId);
            // Forward the raw response directly (it has victim_tree at top level)
            $response = $raw;
            break;

        case 'get_file_content':
            $logId = trim($_REQUEST['log_id'] ?? '');
            $fileId = trim($_REQUEST['file_id'] ?? '');
            $searchId = trim($_REQUEST['search_id'] ?? '');
            if (empty($logId) || empty($fileId)) throw new Exception('log_id and file_id are required');
            
            // Step 1: Direct OathNet API single file request (0 EXTRA CREDITS when search_id is provided!)
            $directRes = $oathnet->getVictimFileContent($logId, $fileId, $searchId);
            
            $fileText = null;
            if (!empty($directRes['data']['content'])) {
                $fileText = $directRes['data']['content'];
            } elseif (!empty($directRes['content'])) {
                $fileText = $directRes['content'];
            } elseif (!empty($directRes['raw']) && ($directRes['http_code'] ?? 0) === 200) {
                $fileText = $directRes['raw'];
            }

            if ($fileText !== null && $fileText !== '') {
                $response = [
                    'success' => true,
                    'data' => ['content' => mb_convert_encoding($fileText, 'UTF-8', 'UTF-8')]
                ];
                break;
            }

            // Step 2: Fallback to archive ZIP extraction if direct single file endpoint doesn't return text
            $cacheDir = __DIR__ . '/cache';
            if (!is_dir($cacheDir)) @mkdir($cacheDir, 0777, true);
            
            $zipPath = $cacheDir . '/' . preg_replace('/[^a-zA-Z0-9_\-]/', '', $logId) . '.zip';
            
            if (!file_exists($zipPath) || filesize($zipPath) === 0) {
                $fp = @fopen($zipPath, 'w+');
                if ($fp) {
                    $url = rtrim(OATHNET_BASE_URL, '/') . '/service/v2/victims/' . urlencode($logId) . '/archive';
                    if (!empty($searchId)) {
                        $url .= '?search_id=' . urlencode($searchId);
                    }
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_FILE, $fp);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-api-key: ' . OATHNET_API_KEY]);
                    curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    fclose($fp);
                    
                    if ($httpCode !== 200) {
                        @unlink($zipPath);
                    }
                }
            }
            
            if (file_exists($zipPath) && filesize($zipPath) > 0) {
                $zip = new ZipArchive;
                if ($zip->open($zipPath) === TRUE) {
                    $content = $zip->getFromName($fileId);
                    if ($content === false) {
                        for ($i = 0; $i < $zip->numFiles; $i++) {
                            $name = $zip->getNameIndex($i);
                            if (strtolower($name) === strtolower($fileId) || str_ends_with(strtolower($name), strtolower($fileId))) {
                                $content = $zip->getFromIndex($i);
                                break;
                            }
                        }
                    }
                    if ($content !== false) {
                        $response = [
                            'success' => true,
                            'data' => ['content' => mb_convert_encoding($content, 'UTF-8', 'UTF-8')]
                        ];
                        $zip->close();
                        break;
                    }
                    $zip->close();
                }
            }

            // Return clean JSON failure so frontend modal never hangs!
            $response = [
                'success' => false,
                'message' => 'File content not found or empty in log.'
            ];
            break;

        case 'cc_dumper_scan_log':
            $logId = trim($_REQUEST['log_id'] ?? '');
            $searchId = trim($_REQUEST['search_id'] ?? '');
            if (empty($logId)) throw new Exception('log_id is required');
            
            // We do NOT deduct credits here, the frontend already deducted 1 credit on the initial cc_dumper search request
            $manifest = $oathnet->getVictimManifest($logId, $searchId);
            $cardsFound = [];
            
            if (!empty($manifest['victim_tree'])) {
                $scanAll = isset($_REQUEST['scan_all_files']) && $_REQUEST['scan_all_files'] === 'true';
                
                // Determine if this is a ZPAK archive (no file IDs)
                $isZpak = true;
                if (isset($manifest['victim_tree']['children'])) {
                    foreach ($manifest['victim_tree']['children'] as $child) {
                        if (!empty($child['id'])) {
                            $isZpak = false;
                            break;
                        }
                    }
                }

                // If it's a force scan OR it's a ZPAK archive, we must download the whole zip
                if ($scanAll || $isZpak) {
                    $tmpFile = tempnam(sys_get_temp_dir(), 'stealer_zip');
                    $fp = fopen($tmpFile, 'w+');
                    
                    $url = rtrim(OATHNET_BASE_URL, '/') . '/service/v2/victims/' . urlencode($logId) . '/archive';
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_FILE, $fp);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-api-key: ' . OATHNET_API_KEY]);
                    curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    fclose($fp);
                    
                    if ($httpCode === 200) {
                        $zip = new ZipArchive;
                        if ($zip->open($tmpFile) === TRUE) {
                            for($i = 0; $i < $zip->numFiles; $i++) {
                                $name = strtolower($zip->getNameIndex($i));
                                $isTargetFile = $scanAll ? 
                                    (str_ends_with($name, '.txt') || str_ends_with($name, '.csv') || str_ends_with($name, '.log')) :
                                    (preg_match('/(cc|card|credit|bank|billing|autofill|information)/i', $name) && (str_ends_with($name, '.txt') || str_ends_with($name, '.csv') || str_ends_with($name, '.log')));
                                
                                if ($isTargetFile) {
                                    $text = $zip->getFromIndex($i);
                                    if ($text) {
                                        preg_match_all('/\b(?:\d[ -]*?){13,16}\b/', $text, $matches);
                                        if (!empty($matches[0])) {
                                            foreach ($matches[0] as $match) {
                                                $cleanCard = preg_replace('/[^\d]/', '', $match);
                                                if (strlen($cleanCard) >= 13 && strlen($cleanCard) <= 16) {
                                                    $cardsFound[] = $cleanCard;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $zip->close();
                        }
                    }
                    @unlink($tmpFile);
                } else {
                    // Standard scan for fast bulk parsing (only looking at cloud directory files)
                    $filesToScan = [];
                    $queue = [$manifest['victim_tree']];
                    while (!empty($queue)) {
                        $node = array_shift($queue);
                        if (($node['type'] ?? '') === 'file' && !empty($node['id'])) {
                            $name = strtolower($node['name'] ?? '');
                            if (preg_match('/(cc|card|credit|bank|billing|autofill|information)/i', $name) && (str_ends_with($name, '.txt') || str_ends_with($name, '.csv') || str_ends_with($name, '.log'))) {
                                $filesToScan[] = $node['id'];
                            }
                        }
                        if (!empty($node['children'])) {
                            foreach ($node['children'] as $child) {
                                $queue[] = $child;
                            }
                        }
                    }
                    
                    foreach ($filesToScan as $fId) {
                        $fContent = $oathnet->getVictimFileContent($logId, $fId, $searchId);
                        if (!empty($fContent['data']['content'])) {
                            $text = $fContent['data']['content'];
                            preg_match_all('/\b(?:\d[ -]*?){13,16}\b/', $text, $matches);
                            if (!empty($matches[0])) {
                                foreach ($matches[0] as $match) {
                                    $cleanCard = preg_replace('/[^\d]/', '', $match);
                                    if (strlen($cleanCard) >= 13 && strlen($cleanCard) <= 16) {
                                        $cardsFound[] = $cleanCard;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            $response = [
                'success' => true,
                'log_id' => $logId,
                'cards' => array_unique($cardsFound)
            ];
            break;

        case 'get_victim_summary':
            $logId = trim($_REQUEST['log_id'] ?? '');
            $searchId = trim($_REQUEST['search_id'] ?? '');
            if (empty($logId)) throw new Exception('log_id is required');
            $response = $oathnet->getVictimSummary($logId, $searchId);
            break;

        case 'download_victim_archive':
            $logId = trim($_GET['log_id'] ?? $_REQUEST['log_id'] ?? '');
            $searchId = trim($_GET['search_id'] ?? $_REQUEST['search_id'] ?? '');
            if (empty($logId)) {
                echo json_encode(['success' => false, 'message' => 'log_id is required']);
                exit;
            }
            // Must clear the default Content-Type: application/json set at top
            header_remove('Content-Type');
            // Stream zip directly from OathNet - must include User-Agent for Cloudflare
            $url = rtrim(OATHNET_BASE_URL, '/') . '/service/v2/victims/' . urlencode($logId) . '/archive';
            if (!empty($searchId)) {
                $url .= '?search_id=' . urlencode($searchId);
            }
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'x-api-key: ' . OATHNET_API_KEY,
                'Accept: application/zip, application/octet-stream, */*',
            ]);
            $zipData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($httpCode === 200 && $zipData) {
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="victim_' . $logId . '.zip"');
                header('Content-Length: ' . strlen($zipData));
                echo $zipData;
            } else {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Archive download failed (HTTP ' . $httpCode . ')']);
            }
            exit;

        case 'list_scanners':
            $response = $oathnet->listScanners();
            break;

        case 'get_music_list':
            $musicDir = __DIR__ . '/assets/music/';
            $songs = [];
            if (is_dir($musicDir)) {
                $files = scandir($musicDir);
                foreach ($files as $file) {
                    if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'mp3') {
                        $songs[] = [
                            'name' => pathinfo($file, PATHINFO_FILENAME),
                            'path' => 'assets/music/' . $file
                        ];
                    }
                }
            }
            $response = ['success' => true, 'data' => $songs];
            break;

        default:
            throw new Exception('Action not recognized');
    }
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// Add JSON_INVALID_UTF8_SUBSTITUTE to handle malformed bytes in stealer logs without failing
$json = json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

@ob_end_clean();
if ($json === false) {
    echo json_encode(['success' => false, 'message' => 'JSON Encoding Error: ' . json_last_error_msg()]);
} else {
    echo $json;
}
