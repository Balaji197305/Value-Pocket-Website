<?php
if (session_id() == '') {
    session_start();
}
require_once dirname(__FILE__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $comment = isset($_POST['comment']) ? trim($_POST['comment']) : '';

    if (empty($name) || empty($email) || empty($comment)) {
        $_SESSION['comment_status'] = 'error';
        $_SESSION['comment_message'] = 'Please fill in all required fields (Name, Email, and Comment).';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['comment_status'] = 'error';
        $_SESSION['comment_message'] = 'Invalid email address format.';
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO blog_comments (name, email, comment) VALUES (?, ?, ?)");
            $stmt->execute(array($name, $email, $comment));
            
            $_SESSION['comment_status'] = 'success';
            $_SESSION['comment_message'] = 'Your comment has been posted successfully!';
        } catch (PDOException $e) {
            $_SESSION['comment_status'] = 'error';
            $_SESSION['comment_message'] = 'An error occurred while posting your comment. Please try again.';
        }
    }
    
    // Redirect back
    $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'single-post.php';
    header("Location: " . $referer);
    exit;
} else {
    header("Location: index.php");
    exit;
}
