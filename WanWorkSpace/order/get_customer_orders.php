<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$customerId = isset($_GET['customerId']) ? mysqli_real_escape_string($dbconnect, $_GET['customerId']) : '';

if (empty($customerId)) {
    echo json_encode(['success' => false, 'message' => 'Customer ID required']);
    exit;
}

$sql = "SELECT o.OrderID, o.OrderDate, o.OrderAmount, o.OrderStatus, o.Quantity, o.Size, o.Colour, o.DeliveryType,
               s.StockID, s.StockName, s.StockCategory
        FROM `order` o
        LEFT JOIN stock s ON o.StockID = s.StockID
        WHERE o.CustomerID = '$customerId'
        ORDER BY o.OrderDate DESC";
        
$result = mysqli_query($dbconnect, $sql);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($dbconnect);
?>
