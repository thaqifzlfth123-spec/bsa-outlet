<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutlet";  // Changed from bsaoutlet to match SQL

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateNextStockId($conn) {
    $sql = "SELECT MAX(StockID) as max_id FROM stock";
    $result = mysqli_query($conn, $sql);
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

$stockName = mysqli_real_escape_string($conn, $input['name'] ?? '');
$stockPrice = mysqli_real_escape_string($conn, $input['price'] ?? 0);
$stockCategory = mysqli_real_escape_string($conn, $input['category'] ?? '');
$stockQuantity = mysqli_real_escape_string($conn, $input['quantity'] ?? 0);

if (empty($stockName) || empty($stockCategory)) {
    echo json_encode(['success' => false, 'message' => 'Product name and category required']);
    exit;
}

$nextId = generateNextStockId($conn);

$sql = "INSERT INTO stock (StockID, StockName, StockQuantity, StockCategory, StockPrice) 
        VALUES ('$nextId', '$stockName', '$stockQuantity', '$stockCategory', '$stockPrice')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Product added successfully!', 'stockId' => $nextId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add product: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>