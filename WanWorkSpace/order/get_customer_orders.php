<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['customerID'])) {
    echo json_encode(['success' => false, 'message' => 'Missing customerID']);
    exit;
}

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

$customerID = mysqli_real_escape_string($dbconnect, $_GET['customerID']);

$sql = "SELECT o.OrderID, o.OrderDate, o.OrderAmount, o.OrderStatus, o.Quantity, o.Size, o.Colour, o.DeliveryType, s.StockID, s.StockName, s.ImageURL 
        FROM `order` o 
        LEFT JOIN stock s ON o.StockID = s.StockID 
        WHERE o.CustomerID = '$customerID' 
        ORDER BY o.OrderDate DESC";

$result = mysqli_query($dbconnect, $sql);
$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($dbconnect);
?>
