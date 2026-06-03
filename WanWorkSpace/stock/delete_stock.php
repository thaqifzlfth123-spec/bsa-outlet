<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$conn = mysqli_connect("localhost","root","","bsaoutletdb");
if(!$conn){ echo json_encode(['success'=>false,'message'=>'DB Error']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$stockId = mysqli_real_escape_string($conn, $input['stockId'] ?? '');

if(empty($stockId)){
    echo json_encode(['success'=>false,'message'=>'Stock ID required']);
    exit;
}

$sql = "DELETE FROM stock WHERE StockID = '$stockId'";
$result = mysqli_query($conn, $sql);

if($result){
    echo json_encode(['success'=>true,'message'=>'Product deleted']);
} else {
    echo json_encode(['success'=>false,'message'=>'Delete failed']);
}
mysqli_close($conn);
?>