<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->stockID) || !isset($data->customerID) || !isset($data->rating)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

$stockID = mysqli_real_escape_string($dbconnect, $data->stockID);
$customerID = mysqli_real_escape_string($dbconnect, $data->customerID);
$rating = (int)$data->rating;
$comment = isset($data->comment) ? mysqli_real_escape_string($dbconnect, $data->comment) : '';

// Simple validation
if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
    exit;
}

$sql = "INSERT INTO review (StockID, CustomerID, Rating, Comment) VALUES ('$stockID', '$customerID', $rating, '$comment')";

if (mysqli_query($dbconnect, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Review added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add review']);
}

mysqli_close($dbconnect);
?>
