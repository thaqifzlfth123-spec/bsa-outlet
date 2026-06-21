<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutlet";  // Changed from bsaoutlet to match SQL

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$stockId = mysqli_real_escape_string($conn, $input['stockId'] ?? '');

if (empty($stockId)) {
    echo json_encode(['success' => false, 'message' => 'Stock ID required']);
    exit;
}

$sql = "DELETE FROM stock WHERE StockID = '$stockId'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Product deleted successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete product: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>