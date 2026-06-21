<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateId($conn) {
    $result = mysqli_query($conn, "SELECT MAX(OrderID) as max FROM `order`");
    $row = mysqli_fetch_assoc($result);
    $max = $row['max'];
    if ($max) {
        $num = intval(substr($max, 1)) + 1;
        return 'O' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
    return 'O001';
}

$input = json_decode(file_get_contents('php://input'), true);

$customerId = mysqli_real_escape_string($conn, $input['customerId'] ?? '');
$employeeId = mysqli_real_escape_string($conn, $input['employeeId'] ?? 'E001');
$stockId = mysqli_real_escape_string($conn, $input['stockId'] ?? 'S001');
$orderAmount = mysqli_real_escape_string($conn, $input['orderAmount'] ?? 0);

if (empty($customerId) || empty($orderAmount)) {
    echo json_encode(['success' => false, 'message' => 'Customer and amount required']);
    exit;
}

$id = generateId($conn);
$date = date('Y-m-d');

$sql = "INSERT INTO `order` (OrderID, OrderDate, OrderAmount, CustomerID, EmployeeID, StockID) 
        VALUES ('$id', '$date', '$orderAmount', '$customerId', '$employeeId', '$stockId')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Order placed', 'orderId' => $id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>