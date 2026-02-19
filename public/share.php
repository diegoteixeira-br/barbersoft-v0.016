<?php
$slug = isset($_GET['slug']) ? $_GET['slug'] : '';

if (empty($slug)) {
    header('Location: /blog');
    exit;
}

$slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', $slug);
$apiUrl = 'https://lgrugpsyewvinlkgmeve.supabase.co/functions/v1/blog-share?slug=' . urlencode($slug);

// Forward the original User-Agent so the Edge Function can detect crawlers
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'PHP-Share-Proxy';

$html = false;

// Tenta file_get_contents primeiro
$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'follow_location' => 0,
        'header' => "Accept: text/html\r\nUser-Agent: " . $userAgent . "\r\n"
    ]
]);
$html = @file_get_contents($apiUrl, false, $context);

// Fallback para cURL
if ($html === false && function_exists('curl_init')) {
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: text/html']);
    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Accept 200 (crawler HTML) or handle 302 (non-crawler redirect)
    if ($httpCode === 302) {
        $redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
        if ($redirectUrl) {
            header('Location: ' . $redirectUrl);
            exit;
        }
    }

    if ($httpCode !== 200) {
        $html = false;
    }
}

if ($html === false) {
    // Fallback: redirect to blog post directly
    header('Location: /blog/' . $slug);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=3600');
echo $html;