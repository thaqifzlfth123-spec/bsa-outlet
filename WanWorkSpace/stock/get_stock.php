<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$sql = "SELECT StockID, StockName, StockQuantity, StockCategory, StockPrice FROM stock";
$result = mysqli_query($dbconnect, $sql);

$stock = [];
while ($row = mysqli_fetch_assoc($result)) {
    $stock[] = $row;
}

echo json_encode(['success' => true, 'stock' => $stock]);
mysqli_close($dbconnect);
?>