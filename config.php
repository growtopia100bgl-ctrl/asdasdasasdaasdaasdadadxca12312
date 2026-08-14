<?php
/**
 * OathFlix OSINT Platform - Global Configuration
 */

// OathNet API Key Integrated Directly
define('OATHNET_API_KEY', 'oath_T8kLHeX1252XXhSIe3Hq08WG4NlI2_yyCDb67Dxb3_M');
define('OATHNET_BASE_URL', 'https://oathnet.org/api');

// Application Settings
define('APP_NAME', 'OathFlix');
define('APP_TAGLINE', 'Unlimited Intelligence & OSINT Recon Studio');
define('APP_VERSION', '2.0.0');

// Error reporting for production/dev
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', 0);
