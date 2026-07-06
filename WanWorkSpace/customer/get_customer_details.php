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

if (!isset($_GET['customerID'])) {
    echo json_encode(['success' => false, 'message' => 'Missing customerID']);
    exit;
}

$customerID = mysqli_real_escape_string($dbconnect, $_GET['customerID']);

$sql = "SELECT CustomerID, CustomerName, CustomerEmail, CustomerPhone, CustomerAddress, IsMember, MembershipLevel, Points FROM customer WHERE CustomerID = '$customerID'";
$result = mysqli_query($dbconnect, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'customer' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Customer not found']);
}

mysqli_close($dbconnect);
?>
