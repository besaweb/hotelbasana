<?php
/**
 * Hotel Basana — booking request form handler.
 * Validates the "Request Your Stay" form and emails the hotel.
 * Responds with JSON so the front-end AJAX submit (js/script.js) can show
 * a translated success/error message without a page reload.
 *
 * Requires: PHP mail() to be configured on the hosting server (most shared
 * hosting has this out of the box; on some hosts you may need to set
 * sendmail_path / SMTP in php.ini, or swap mail() below for PHPMailer+SMTP
 * if the hosting provider requires authenticated SMTP).
 */

header('Content-Type: application/json; charset=utf-8');

// ---- config -----------------------------------------------------------
$to_email   = 'info@hotelbesana.al';
$from_email = 'noreply@hotelbesana.al'; // should match the sending domain to avoid spam filtering
$site_name  = 'Hotel Basana';

// ---- only accept POST --------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

// ---- honeypot spam trap (hidden "company" field must stay empty) -------
if (!empty($_POST['company'])) {
    // Silently pretend success so bots don't learn the trap failed.
    echo json_encode(['ok' => true]);
    exit;
}

// ---- helpers ------------------------------------------------------------
function clean($v) {
    $v = trim((string) $v);
    $v = str_replace(["\r", "\n"], ' ', $v); // header-injection guard for single-line fields
    return $v;
}

// ---- collect + validate ---------------------------------------------------
$name    = clean($_POST['name'] ?? '');
$email   = clean($_POST['email'] ?? '');
$phone   = clean($_POST['phone'] ?? '');
$guests  = clean($_POST['guests'] ?? '');
$checkin = clean($_POST['checkin'] ?? '');
$checkout= clean($_POST['checkout'] ?? '');
$room    = clean($_POST['room'] ?? '');
$message = trim((string) ($_POST['message'] ?? ''));

$errors = [];
if ($name === '') $errors[] = 'name';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($message === '') $errors[] = 'message';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// ---- build email ---------------------------------------------------------
$subject = "New stay request from $name — $site_name website";

$body  = "New request submitted via the Hotel Basana website:\n\n";
$body .= "Name:        $name\n";
$body .= "Email:       $email\n";
$body .= "Phone:       " . ($phone !== '' ? $phone : '-') . "\n";
$body .= "Guests:      " . ($guests !== '' ? $guests : '-') . "\n";
$body .= "Check-in:    " . ($checkin !== '' ? $checkin : '-') . "\n";
$body .= "Check-out:   " . ($checkout !== '' ? $checkout : '-') . "\n";
$body .= "Room:        " . ($room !== '' ? $room : '-') . "\n";
$body .= "\nMessage:\n$message\n";
$body .= "\n---\nSubmitted: " . date('Y-m-d H:i:s') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers   = [];
$headers[] = "From: $site_name Website <$from_email>";
$headers[] = "Reply-To: $name <$email>";
$headers[] = "Content-Type: text/plain; charset=utf-8";

$sent = @mail($to_email, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'mail_failed']);
    exit;
}

echo json_encode(['ok' => true]);
