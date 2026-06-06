<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => mysqli_connect_error()
    ]);
    exit;
}

$sql = "SELECT COUNT(*) as total FROM stock";
$result = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($result);

echo json_encode([
    'success' => true,
    'message' => 'API is working!',
    'database' => $dbname,
    'stock_count' => $row['total'],
    'timestamp' => date('Y-m-d H:i:s')
]);

mysqli_close($conn);
?>