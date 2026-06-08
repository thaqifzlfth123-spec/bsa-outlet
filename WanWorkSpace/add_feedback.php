<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutlet";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

function generateNextId($conn) {
    $sql = "SELECT MAX(FeedbackID) as max_id FROM feedback";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    $maxId = $row['max_id'];
    
    if ($maxId) {
        $num = intval(substr($maxId, 1)) + 1;
        return 'F' . str_pad($num, 3, '0', STR_PAD_LEFT);
    } else {
        return 'F001';
    }
}

$input = json_decode(file_get_contents('php://input'), true);

$orderId = mysqli_real_escape_string($conn, $input['orderId'] ?? '');
$customerId = mysqli_real_escape_string($conn, $input['customerId'] ?? '');

if (empty($orderId) || empty($customerId)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and Customer ID required']);
    exit;
}

$nextId = generateNextId($conn);
$date = date('Y-m-d');

$sql = "INSERT INTO feedback (FeedbackID, FeedbackDate, OrderID, CustomerID) 
        VALUES ('$nextId', '$date', '$orderId', '$customerId')";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Feedback submitted', 'feedbackId' => $nextId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit feedback: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>