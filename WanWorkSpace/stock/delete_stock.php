<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$stockId = $input['stockId'] ?? '';

if (empty($stockId)) {
    echo json_encode(['success' => false, 'message' => 'Stock ID required']);
    exit;
}

$sql = "DELETE FROM stock WHERE StockID = '$stockId'";
if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Product deleted']);
} else {
    echo json_encode(['success' => false, 'message' => 'Delete failed']);
}

mysqli_close($conn);
?>