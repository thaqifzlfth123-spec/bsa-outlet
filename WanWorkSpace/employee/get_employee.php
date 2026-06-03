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

$sql = "SELECT EmployeeID, EmployeeName, empDOB, empAddress, empHiredDate FROM employee";
$result = mysqli_query($dbconnect, $sql);

$employees = [];
while ($row = mysqli_fetch_assoc($result)) {
    $employees[] = $row;
}

echo json_encode(['success' => true, 'employees' => $employees]);
mysqli_close($dbconnect);
?>