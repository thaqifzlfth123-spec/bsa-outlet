<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$customerId = mysqli_real_escape_string($dbconnect, $input['customerId'] ?? '');
$isMember = isset($input['isMember']) ? (int)$input['isMember'] : 0;
$membershipLevel = mysqli_real_escape_string($dbconnect, $input['membershipLevel'] ?? 'Non-Member');
$points = isset($input['points']) ? (int)$input['points'] : 0;

if (empty($customerId)) {
    echo json_encode(['success' => false, 'message' => 'Customer ID is required']);
    exit;
}

$sql = "UPDATE customer SET IsMember = $isMember, MembershipLevel = '$membershipLevel', Points = $points WHERE CustomerID = '$customerId'";

$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Membership updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update membership']);
}

mysqli_close($dbconnect);
?>
