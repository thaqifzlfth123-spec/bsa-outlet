<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$sql = "SELECT f.FeedbackID, f.FeedbackDate, f.OrderID, f.CustomerID,
               c.CustomerName
        FROM feedback f
        LEFT JOIN customer c ON f.CustomerID = c.CustomerID";
$result = mysqli_query($dbconnect, $sql);

$feedback = [];
while ($row = mysqli_fetch_assoc($result)) {
    $feedback[] = $row;
}

echo json_encode(['success' => true, 'feedback' => $feedback]);
mysqli_close($dbconnect);
?>