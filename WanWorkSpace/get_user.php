<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsaoutletdb";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Database Connection Error']);
    exit;
}

$email = mysqli_real_escape_string($dbconnect, $_GET['email'] ?? '');
$userType = mysqli_real_escape_string($dbconnect, $_GET['userType'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email required']);
    mysqli_close($dbconnect);
    exit;
}

if ($userType === 'customer') {
    $sql = "SELECT CustomerID as id, CustomerName as name, CustomerEmail as email, CustomerAddress as address, 
                   IsMember, MembershipLevel, Points 
            FROM customer WHERE CustomerEmail = '$email'";
    $result = mysqli_query($dbconnect, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user, 'type' => 'customer']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
    
} else if ($userType === 'staff') {
    $sql = "SELECT EmployeeID as id, EmployeeName as name, EmployeeEmail as email, empDOB as dob, 
                   empAddress as address, EmployeePhone as phone 
            FROM employee WHERE EmployeeEmail = '$email'";
    $result = mysqli_query($dbconnect, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user, 'type' => 'staff']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Staff not found']);
    }
    
} else {
    // Try customer first
    $sql = "SELECT CustomerID as id, CustomerName as name, CustomerEmail as email, 'customer' as type 
            FROM customer WHERE CustomerEmail = '$email'";
    $result = mysqli_query($dbconnect, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user]);
        mysqli_close($dbconnect);
        exit;
    }
    
    // Try employee
    $sql = "SELECT EmployeeID as id, EmployeeName as name, EmployeeEmail as email, 'staff' as type 
            FROM employee WHERE EmployeeEmail = '$email'";
    $result = mysqli_query($dbconnect, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

mysqli_close($dbconnect);
?>