<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$stockId = mysqli_real_escape_string($dbconnect, $input['stockId'] ?? '');

if (empty($stockId)) {
    echo json_encode(['success' => false, 'message' => 'Stock ID required']);
    exit;
}

$sql = "DELETE FROM stock WHERE StockID = '$stockId'";
$result = mysqli_query($dbconnect, $sql);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Product deleted successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
}

mysqli_close($dbconnect);
?>