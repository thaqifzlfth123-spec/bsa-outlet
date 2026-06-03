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

$sql = "SELECT o.OrderID, o.OrderDate, o.OrderAmount, 
               o.CustomerID, o.CustomerName,
               o.EmployeeID, o.EmployeeName,
               s.StockID, s.StockQuantity, s.StockCategory
        FROM orders o
        LEFT JOIN stock s ON o.StockID = s.StockID";
$result = mysqli_query($dbconnect, $sql);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($dbconnect);
?>