<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Database Connection Error']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $customerEmail = mysqli_real_escape_string($dbconnect, $input['email'] ?? '');
    $customerName = mysqli_real_escape_string($dbconnect, $input['name'] ?? '');
    
    if (empty($customerEmail) && empty($customerName)) {
        echo json_encode(['success' => false, 'message' => 'Email or Name required']);
        mysqli_close($dbconnect);
        exit;
    }
    
    if (!empty($customerEmail)) {
        $findSql = "SELECT CustomerID FROM customer WHERE CustomerEmail = '$customerEmail'";
    } else {
        $findSql = "SELECT CustomerID FROM customer WHERE CustomerName = '$customerName'";
    }
    $findResult = mysqli_query($dbconnect, $findSql);
    
    if (mysqli_num_rows($findResult) == 0) {
        echo json_encode(['success' => false, 'message' => 'Customer not found. Please register first.']);
        mysqli_close($dbconnect);
        exit;
    }
    
    $row = mysqli_fetch_assoc($findResult);
    $customerId = $row['CustomerID'];
    
    $level = mysqli_real_escape_string($dbconnect, $input['level'] ?? 'Basic');
    $date = date('Y-m-d H:i:s');
    
    $sql = "UPDATE customer 
            SET IsMember = 1, 
                MembershipLevel = '$level', 
                Points = 100,
                JoinDate = '$date'
            WHERE CustomerID = '$customerId'";
    $result = mysqli_query($dbconnect, $sql);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Congratulations! You are now a member!',
            'level' => $level,
            'points' => 100,
            'customerId' => $customerId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to register membership']);
    }
    
} else if ($method === 'GET') {
    $customerEmail = mysqli_real_escape_string($dbconnect, $_GET['email'] ?? '');
    $customerName = mysqli_real_escape_string($dbconnect, $_GET['name'] ?? '');
    
    if (empty($customerEmail) && empty($customerName)) {
        echo json_encode(['success' => false, 'message' => 'Email or Name required']);
        mysqli_close($dbconnect);
        exit;
    }
    
    if (!empty($customerEmail)) {
        $sql = "SELECT CustomerID, CustomerName, IsMember, MembershipLevel, Points, JoinDate 
                FROM customer WHERE CustomerEmail = '$customerEmail'";
    } else {
        $sql = "SELECT CustomerID, CustomerName, IsMember, MembershipLevel, Points, JoinDate 
                FROM customer WHERE CustomerName = '$customerName'";
    }
    $result = mysqli_query($dbconnect, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $customer = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'membership' => $customer]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
}

mysqli_close($dbconnect);
?>