<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutlet";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

$sql = "SELECT EmployeeID, EmployeeName, EmpDOB, EmpAddress, EmpHiredDate, EmployeeEmail, EmployeePhone FROM employee";
$result = mysqli_query($conn, $sql);

$employees = [];
while ($row = mysqli_fetch_assoc($result)) {
    $employees[] = $row;
}

echo json_encode(['success' => true, 'employees' => $employees]);
mysqli_close($conn);
?>