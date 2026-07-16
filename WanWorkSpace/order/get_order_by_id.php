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

$orderId = isset($_GET['orderId']) ? mysqli_real_escape_string($dbconnect, $_GET['orderId']) : '';

if (empty($orderId)) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

// Fetch the order and calculate the member discount if any
$sql = "SELECT o.OrderID, o.OrderAmount, o.OrderStatus, o.Quantity, c.IsMember 
        FROM `order` o
        LEFT JOIN customer c ON o.CustomerID = c.CustomerID
        WHERE o.OrderID = '$orderId'
        LIMIT 1";

$result = mysqli_query($dbconnect, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    $discount = 0;
    // We cannot easily recalculate the exact discount from the DB total without the original price,
    // but the DB stores the final OrderAmount which has the discount applied if IsMember=1.
    // However, since the receipt displays the Member Savings, we'll try to estimate or return 0 for now.
    // It's better to just return the final OrderAmount for the receipt.
    echo json_encode([
        'success' => true, 
        'order' => $row
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Order not found']);
}

mysqli_close($dbconnect);
?>
