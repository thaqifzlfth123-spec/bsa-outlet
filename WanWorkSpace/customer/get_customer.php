<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$sql = "SELECT CustomerID, CustomerName, CustomerEmail, CustomerPhone, IsMember, MembershipLevel FROM customer";
$result = mysqli_query($conn, $sql);

$customers = [];
while ($row = mysqli_fetch_assoc($result)) {
    $customers[] = $row;
}

echo json_encode(['success' => true, 'customers' => $customers]);
mysqli_close($conn);
?>