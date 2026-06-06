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

$sql = "SELECT CustomerID, CustomerName, CustomerEmail, CustomerPhone, CustomerAddress FROM customer";
$result = mysqli_query($conn, $sql);

$customers = [];
while ($row = mysqli_fetch_assoc($result)) {
    $customers[] = $row;
}

echo json_encode(['success' => true, 'customers' => $customers]);
mysqli_close($conn);
?>