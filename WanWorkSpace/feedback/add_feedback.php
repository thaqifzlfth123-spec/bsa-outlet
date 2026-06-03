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
    $sql = "SELECT MAX(FeedbackID) as max_id FROM feedback";
    $result = mysqli_query($dbconnect, $sql);
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

$orderId = mysqli_real_escape_string($dbconnect, $input['orderId'] ?? '');
$customerId = mysqli_real_escape_string($dbconnect, $input['customerId'] ?? '');

if (empty($orderId) || empty($customerId)) {
    echo json_encode(['success' => false, 'message' => 'Order ID and Customer ID required']);
    exit;
}

$nextId = generateNextId($dbconnect);
$date = date('Y-m-d');

$sql = "INSERT INTO feedback (FeedbackID, FeedbackDate, OrderID, CustomerID) 
        VALUES ('$nextId', '$date', '$orderId', '$customerId')";

$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Feedback submitted', 'feedbackId' => $nextId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit feedback']);
}

mysqli_close($dbconnect);
?>