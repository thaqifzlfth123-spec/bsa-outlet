<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateNextId($dbconnect) {
    $sql = "SELECT MAX(StockID) as max_id FROM stock";
    $result = mysqli_query($dbconnect, $sql);
    $row = mysqli_fetch_assoc($result);
    $maxId = $row['max_id'];
    
    if ($maxId) {
        $num = intval(substr($maxId, 1)) + 1;
        return 'S' . str_pad($num, 3, '0', STR_PAD_LEFT);
    } else {
        return 'S001';
    }
}

$input = json_decode(file_get_contents('php://input'), true);

$stockName = mysqli_real_escape_string($dbconnect, $input['name'] ?? '');
$stockPrice = mysqli_real_escape_string($dbconnect, $input['price'] ?? 0);
$stockCategory = mysqli_real_escape_string($dbconnect, $input['category'] ?? '');
$stockQuantity = mysqli_real_escape_string($dbconnect, $input['quantity'] ?? 0);

if (empty($stockName) || empty($stockCategory)) {
    echo json_encode(['success' => false, 'message' => 'Product name and category required']);
    exit;
}

$nextId = generateNextId($dbconnect);

$sql = "INSERT INTO stock (StockID, StockName, StockQuantity, StockCategory, StockPrice) 
        VALUES ('$nextId', '$stockName', '$stockQuantity', '$stockCategory', '$stockPrice')";

$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Stock added successfully!', 'stockId' => $nextId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add stock: ' . mysqli_error($dbconnect)]);
}

mysqli_close($dbconnect);
?>