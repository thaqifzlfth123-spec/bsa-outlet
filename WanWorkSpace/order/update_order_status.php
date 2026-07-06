<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$orderId = mysqli_real_escape_string($dbconnect, $input['orderId'] ?? '');
$status = mysqli_real_escape_string($dbconnect, $input['status'] ?? '');

if (empty($orderId) || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and Status required']);
    exit;
}

$sql = "UPDATE `order` SET OrderStatus = '$status' WHERE OrderID = '$orderId'";
$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Order status updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update order: ' . mysqli_error($dbconnect)]);
}

mysqli_close($dbconnect);
?>
