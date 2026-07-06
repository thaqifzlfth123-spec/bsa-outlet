<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->customerID) || !isset($data->name) || !isset($data->email)) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

$customerID = mysqli_real_escape_string($dbconnect, $data->customerID);
$name = mysqli_real_escape_string($dbconnect, $data->name);
$email = mysqli_real_escape_string($dbconnect, $data->email);
$phone = isset($data->phone) ? mysqli_real_escape_string($dbconnect, $data->phone) : '';
$address = isset($data->address) ? mysqli_real_escape_string($dbconnect, $data->address) : '';

$sql = "UPDATE customer SET CustomerName='$name', CustomerEmail='$email', CustomerPhone='$phone', CustomerAddress='$address' WHERE CustomerID='$customerID'";

if (mysqli_query($dbconnect, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}

mysqli_close($dbconnect);
?>
