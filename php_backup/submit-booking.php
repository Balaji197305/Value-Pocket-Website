<?php
if (session_id() == '') {
    session_start();
}
require_once dirname(__FILE__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = isset($_POST['full_name']) ? trim($_POST['full_name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $service = isset($_POST['service']) ? trim($_POST['service']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if (empty($full_name) || empty($email)) {
        $_SESSION['booking_status'] = 'error';
        $_SESSION['booking_message'] = 'Please fill in all required fields (Full Name and Email Address).';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['booking_status'] = 'error';
        $_SESSION['booking_message'] = 'Invalid email address format.';
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO bookings (full_name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(array($full_name, $email, $phone, $service, $message));
            
            $_SESSION['booking_status'] = 'success';
            $_SESSION['booking_message'] = 'Thank you! Your consultation booking has been submitted. We will contact you soon.';
        } catch (PDOException $e) {
            $_SESSION['booking_status'] = 'error';
            $_SESSION['booking_message'] = 'An error occurred while saving your booking. Please try again.';
        }
    }
    
    // Redirect back
    $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'contact.php';
    header("Location: " . $referer);
    exit;
} else {
    header("Location: index.php");
    exit;
}
