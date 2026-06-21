<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$orderId = mysqli_real_escape_string($conn, $input['orderId'] ?? '');
$status = mysqli_real_escape_string($conn, $input['status'] ?? '');

if (empty($orderId) || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status required']);
    exit;
}

// Note: order table doesn't have OrderStatus column in the original structure!
// We need to add it first OR we can use a different approach

// First, let's check if OrderStatus column exists
$checkColumn = mysqli_query($conn, "SHOW COLUMNS FROM `order` LIKE 'OrderStatus'");
if (mysqli_num_rows($checkColumn) == 0) {
    // Add OrderStatus column if it doesn't exist
    mysqli_query($conn, "ALTER TABLE `order` ADD COLUMN OrderStatus varchar(50) DEFAULT 'Pending'");
}

$sql = "UPDATE `order` SET OrderStatus = '$status' WHERE OrderID = '$orderId'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update order: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>