<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$conn = mysqli_connect("localhost","root","","bsaoutletdb");
if(!$conn){ echo json_encode(['success'=>false,'message'=>'DB Error']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$orderId = mysqli_real_escape_string($conn, $input['orderId'] ?? '');
$status = mysqli_real_escape_string($conn, $input['status'] ?? '');

if(empty($orderId) || empty($status)){
    echo json_encode(['success'=>false,'message'=>'Order ID and status required']);
    exit;
}

$sql = "UPDATE orders SET OrderStatus = '$status' WHERE OrderID = '$orderId'";
$result = mysqli_query($conn, $sql);

if($result){
    echo json_encode(['success'=>true,'message'=>'Order updated']);
} else {
    echo json_encode(['success'=>false,'message'=>'Update failed']);
}
mysqli_close($conn);
?>