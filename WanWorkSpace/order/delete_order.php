<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

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

if (empty($orderId)) {
    echo json_encode(['success' => false, 'message' => 'Order ID required']);
    exit;
}

$sql = "DELETE FROM `order` WHERE OrderID = '$orderId'";
$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Order deleted successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete order: ' . mysqli_error($dbconnect)]);
}

mysqli_close($dbconnect);
?>
