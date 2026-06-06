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

$sql = "SELECT OrderID, OrderDate, OrderAmount, CustomerID, CustomerName, OrderStatus FROM orders ORDER BY OrderDate DESC";
$result = mysqli_query($conn, $sql);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($conn);
?>