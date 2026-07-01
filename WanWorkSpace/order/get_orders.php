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

$sql = "SELECT o.OrderID, o.OrderDate, o.OrderAmount, o.OrderStatus, o.Quantity, o.Size, o.Colour, o.DeliveryType,
               o.CustomerID, o.CustomerName, c.CustomerEmail, c.CustomerPhone, c.IsMember,
               o.EmployeeID, o.EmployeeName,
               s.StockID, s.StockName, s.StockCategory
        FROM \`order\` o
        LEFT JOIN stock s ON o.StockID = s.StockID
        LEFT JOIN customer c ON o.CustomerID = c.CustomerID";
$result = mysqli_query($dbconnect, $sql);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($dbconnect);
?>
