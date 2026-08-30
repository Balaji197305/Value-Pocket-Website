<?php
if (session_id() == '') {
    session_start();
}
require_once dirname(__FILE__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';

    if (empty($email)) {
        $_SESSION['newsletter_status'] = 'error';
        $_SESSION['newsletter_message'] = 'Please enter your email address.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['newsletter_status'] = 'error';
        $_SESSION['newsletter_message'] = 'Invalid email address format.';
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)");
            $stmt->execute(array($email));
            
            $_SESSION['newsletter_status'] = 'success';
            $_SESSION['newsletter_message'] = 'Thank you! You have successfully subscribed to our newsletter.';
        } catch (PDOException $e) {
            // Check for duplicate key entry error (typically code 23000)
            if ($e->getCode() == '23000' || strpos($e->getMessage(), '1062') !== false) {
                $_SESSION['newsletter_status'] = 'info';
                $_SESSION['newsletter_message'] = 'You are already subscribed to our newsletter.';
            } else {
                $_SESSION['newsletter_status'] = 'error';
                $_SESSION['newsletter_message'] = 'An error occurred. Please try again later.';
            }
        }
    }
    
    // Redirect back
    $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'index.php';
    header("Location: " . $referer);
    exit;
} else {
    header("Location: index.php");
    exit;
}
