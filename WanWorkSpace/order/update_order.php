<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$orderId = mysqli_real_escape_string($dbconnect, $input['orderId'] ?? '');
$status = mysqli_real_escape_string($dbconnect, $input['status'] ?? '');

if (empty($orderId) || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status required']);
    exit;
}

$sql = "UPDATE orders SET OrderStatus = '$status' WHERE OrderID = '$orderId'";
$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update order']);
}

mysqli_close($dbconnect);
?>