<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => mysqli_connect_error()
    ]);
    exit;
}

$stockResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM stock");
$stockRow = mysqli_fetch_assoc($stockResult);
$customerResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM customer");
$customerRow = mysqli_fetch_assoc($customerResult);
$orderResult = mysqli_query($conn, "SELECT COUNT(*) as total FROM orders");
$orderRow = mysqli_fetch_assoc($orderResult);

echo json_encode([
    'success' => true,
    'message' => 'API is working!',
    'database' => $database,
    'stock_count' => $stockRow['total'],
    'customer_count' => $customerRow['total'],
    'order_count' => $orderRow['total'],
    'api_path' => __DIR__,
    'timestamp' => date('Y-m-d H:i:s')
]);

mysqli_close($conn);
?>