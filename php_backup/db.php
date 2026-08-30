<?php
// Database configuration
$host = 'localhost';
$db   = 'vaultedge';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;dbname=$db";
$options = array(
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
);

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     $pdo->exec("SET NAMES utf8");
} catch (PDOException $e) {
     die("Database connection failed: " . $e->getMessage());
}
