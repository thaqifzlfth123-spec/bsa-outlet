<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

$sql = "SELECT StockID, StockName, StockQuantity, StockCategory, StockPrice FROM stock";
$result = mysqli_query($conn, $sql);

$stock = [];
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $stock[] = $row;
    }
    echo json_encode(['success' => true, 'stock' => $stock]);
} else {
    echo json_encode(['success' => true, 'stock' => [], 'message' => 'No stock found']);
}

mysqli_close($conn);
?>