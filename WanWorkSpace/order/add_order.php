<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateId($conn) {
    $result = mysqli_query($conn, "SELECT MAX(OrderID) as max FROM orders");
    $row = mysqli_fetch_assoc($result);
    $max = $row['max'];
    if ($max) {
        $num = intval(substr($max, 1)) + 1;
        return 'O' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
    return 'O001';
}

$input = json_decode(file_get_contents('php://input'), true);

$customerId = $input['customerId'] ?? '';
$customerName = $input['customerName'] ?? '';
$orderAmount = $input['orderAmount'] ?? 0;
$items = $input['items'] ?? '';

if (empty($customerId) || empty($orderAmount)) {
    echo json_encode(['success' => false, 'message' => 'Customer and amount required']);
    exit;
}

$id = generateId($conn);
$date = date('Y-m-d');

$sql = "INSERT INTO orders (OrderID, OrderDate, OrderAmount, CustomerID, CustomerName, OrderStatus) 
        VALUES ('$id', '$date', '$orderAmount', '$customerId', '$customerName', 'Pending')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Order placed', 'orderId' => $id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>