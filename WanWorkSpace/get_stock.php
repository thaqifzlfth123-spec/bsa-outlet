<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutlet";  // Changed from bsaoutlet to match SQL

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

$sql = "SELECT StockID, StockName, StockQuantity, StockCategory, StockPrice FROM stock ORDER BY StockCategory";
$result = mysqli_query($conn, $sql);

$stock = [];
while ($row = mysqli_fetch_assoc($result)) {
    $stock[] = $row;
}

echo json_encode(['success' => true, 'stock' => $stock]);
mysqli_close($conn);
?>