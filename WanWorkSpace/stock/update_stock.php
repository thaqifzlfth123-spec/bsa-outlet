<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$stockId = mysqli_real_escape_string($dbconnect, $input['stockId'] ?? '');
$quantity = mysqli_real_escape_string($dbconnect, $input['quantity'] ?? '');
$price = mysqli_real_escape_string($dbconnect, $input['price'] ?? '');

if (empty($stockId) || $quantity === '' || $price === '') {
    echo json_encode(['success' => false, 'message' => 'Stock ID, Quantity, and Price are required']);
    exit;
}

$sql = "UPDATE stock SET StockQuantity = '$quantity', StockPrice = '$price' WHERE StockID = '$stockId'";
$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Stock updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update stock']);
}

mysqli_close($dbconnect);
?>
