<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateId($conn) {
    $result = mysqli_query($conn, "SELECT MAX(StockID) as max FROM stock");
    $row = mysqli_fetch_assoc($result);
    $max = $row['max'];
    if ($max) {
        $num = intval(substr($max, 1)) + 1;
        return 'S' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
    return 'S001';
}

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? '';
$price = $input['price'] ?? 0;
$category = $input['category'] ?? '';
$quantity = $input['quantity'] ?? 0;

if (empty($name) || empty($price) || empty($category)) {
    echo json_encode(['success' => false, 'message' => 'Name, price and category required']);
    exit;
}

$id = generateId($conn);
$sql = "INSERT INTO stock (StockID, StockName, StockPrice, StockCategory, StockQuantity) 
        VALUES ('$id', '$name', '$price', '$category', '$quantity')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Product added', 'stockId' => $id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>