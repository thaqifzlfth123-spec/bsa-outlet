<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database Connection Error']);
    exit;
}

$email = mysqli_real_escape_string($conn, $_GET['email'] ?? '');
$userType = mysqli_real_escape_string($conn, $_GET['userType'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email required']);
    mysqli_close($conn);
    exit;
}

if ($userType === 'customer') {
    $sql = "SELECT CustomerID as id, CustomerName as name, CustomerEmail as email, CustomerAddress as address, 
                   IsMember, MembershipLevel, Points 
            FROM customer WHERE CustomerEmail = '$email'";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user, 'type' => 'customer']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
    
} else if ($userType === 'staff') {
    $sql = "SELECT EmployeeID as id, EmployeeName as name, EmployeeEmail as email, EmpDOB as dob, 
                   EmpAddress as address, EmployeePhone as phone 
            FROM employee WHERE EmployeeEmail = '$email'";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user, 'type' => 'staff']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Staff not found']);
    }
    
} else {
    $sql = "SELECT CustomerID as id, CustomerName as name, CustomerEmail as email, 'customer' as type 
            FROM customer WHERE CustomerEmail = '$email'";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user]);
        mysqli_close($conn);
        exit;
    }
    
    $sql = "SELECT EmployeeID as id, EmployeeName as name, EmployeeEmail as email, 'staff' as type 
            FROM employee WHERE EmployeeEmail = '$email'";
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

mysqli_close($conn);
?>