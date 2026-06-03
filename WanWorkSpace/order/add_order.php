<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateNextId($dbconnect) {
    $sql = "SELECT MAX(OrderID) as max_id FROM orders";
    $result = mysqli_query($dbconnect, $sql);
    $row = mysqli_fetch_assoc($result);
    $maxId = $row['max_id'];
    
    if ($maxId) {
        $num = intval(substr($maxId, 1)) + 1;
        return 'O' . str_pad($num, 3, '0', STR_PAD_LEFT);
    } else {
        return 'O001';
    }
}

$input = json_decode(file_get_contents('php://input'), true);

$orderDate = mysqli_real_escape_string($dbconnect, $input['orderDate'] ?? date('Y-m-d'));
$orderAmount = mysqli_real_escape_string($dbconnect, $input['orderAmount'] ?? 0);
$customerId = mysqli_real_escape_string($dbconnect, $input['customerId'] ?? '');
$customerName = mysqli_real_escape_string($dbconnect, $input['customerName'] ?? '');
$employeeId = mysqli_real_escape_string($dbconnect, $input['employeeId'] ?? '');
$employeeName = mysqli_real_escape_string($dbconnect, $input['employeeName'] ?? '');
$employeeAddress = mysqli_real_escape_string($dbconnect, $input['employeeAddress'] ?? '');
$stockId = mysqli_real_escape_string($dbconnect, $input['stockId'] ?? '');

if (empty($customerId) || empty($orderAmount)) {
    echo json_encode(['success' => false, 'message' => 'Customer ID and Order Amount required']);
    exit;
}

$nextId = generateNextId($dbconnect);
$sql = "INSERT INTO orders (OrderID, OrderDate, OrderAmount, CustomerID, CustomerName, EmployeeID, EmployeeName, EmployeeAddress, StockID) 
        VALUES ('$nextId', '$orderDate', '$orderAmount', '$customerId', '$customerName', '$employeeId', '$employeeName', '$employeeAddress', '$stockId')";

$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Order added', 'orderId' => $nextId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add order: ' . mysqli_error($dbconnect)]);
}

mysqli_close($dbconnect);
?>