<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

$sql = "SELECT f.FeedbackID, f.FeedbackDate, f.OrderID, f.CustomerID, c.CustomerName
        FROM feedback f
        LEFT JOIN customer c ON f.CustomerID = c.CustomerID
        ORDER BY f.FeedbackDate DESC";
$result = mysqli_query($conn, $sql);

$feedback = [];
while ($row = mysqli_fetch_assoc($result)) {
    $feedback[] = $row;
}

echo json_encode(['success' => true, 'feedback' => $feedback]);
mysqli_close($conn);
?>