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

$sql = "SELECT f.FeedbackID, f.FeedbackDate, f.OrderID, f.CustomerID, f.Message, c.CustomerName 
        FROM feedback f 
        LEFT JOIN customer c ON f.CustomerID = c.CustomerID 
        ORDER BY f.FeedbackID DESC";
$result = mysqli_query($dbconnect, $sql);

$feedbacks = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $feedbacks[] = $row;
    }
    echo json_encode(['success' => true, 'feedbacks' => $feedbacks]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch feedback']);
}

mysqli_close($dbconnect);
?>
