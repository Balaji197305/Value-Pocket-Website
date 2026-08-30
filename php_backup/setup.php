<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read SQL file
    $sql = file_get_contents(dirname(__FILE__) . '/db_setup.sql');
    if ($sql === false) {
        throw new Exception("Could not read db_setup.sql");
    }
    
    // Split by semicolon and run each query
    // Note: this is a simple splitter that works well for standard table creations
    $queries = explode(';', $sql);
    foreach ($queries as $query) {
        $query = trim($query);
        if ($query !== '') {
            $pdo->exec($query);
            echo "Executed: " . substr($query, 0, 50) . "...\n";
        }
    }
    echo "Database setup completed successfully!\n";
} catch (Exception $e) {
    echo "Database setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
