<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$sql = "SELECT StockID, StockName, StockPrice, StockCategory, StockQuantity FROM stock";
$result = mysqli_query($conn, $sql);

$stock = [];
while ($row = mysqli_fetch_assoc($result)) {
    $stock[] = $row;
}

echo json_encode(['success' => true, 'stock' => $stock]);
mysqli_close($conn);
?>