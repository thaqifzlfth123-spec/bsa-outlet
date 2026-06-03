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
    echo json_encode(['success' => false, 'message' => 'Database Connection Error']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$userType = mysqli_real_escape_string($dbconnect, $input['userType'] ?? '');
$name = mysqli_real_escape_string($dbconnect, trim($input['name'] ?? ''));
$email = mysqli_real_escape_string($dbconnect, trim($input['email'] ?? ''));
$password = mysqli_real_escape_string($dbconnect, $input['password'] ?? '');
$address = mysqli_real_escape_string($dbconnect, $input['address'] ?? '');
$phone = mysqli_real_escape_string($dbconnect, $input['phone'] ?? '');
$dob = mysqli_real_escape_string($dbconnect, $input['dob'] ?? '');
$hiredDate = mysqli_real_escape_string($dbconnect, $input['hiredDate'] ?? date('Y-m-d'));

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

$hashedPassword = md5($password);

function generateNextId($dbconnect, $table, $prefix, $idColumn) {
    $sql = "SELECT MAX($idColumn) as max_id FROM $table";
    $result = mysqli_query($dbconnect, $sql);
    $row = mysqli_fetch_assoc($result);
    $maxId = $row['max_id'];
    
    if ($maxId) {
        $num = intval(substr($maxId, strlen($prefix))) + 1;
        return $prefix . str_pad($num, 3, '0', STR_PAD_LEFT);
    } else {
        return $prefix . '001';
    }
}

if ($userType === 'customer') {
    $checkSql = "SELECT CustomerID FROM customer WHERE CustomerEmail = '$email'";
    $checkResult = mysqli_query($dbconnect, $checkSql);
    
    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        mysqli_close($dbconnect);
        exit;
    }
    
    $nextId = generateNextId($dbconnect, 'customer', 'C', 'CustomerID');
    
    $sql = "INSERT INTO customer (CustomerID, CustomerName, CustomerAddress, CustomerEmail, CustomerPassword, CustomerPhone, IsMember, Points, JoinDate) 
            VALUES ('$nextId', '$name', '$address', '$email', '$hashedPassword', '$phone', 0, 0, NOW())";
    
    $result = mysqli_query($dbconnect, $sql);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Customer registered successfully!',
            'userType' => 'customer',
            'userId' => $nextId,
            'name' => $name,
            'email' => $email
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to register: ' . mysqli_error($dbconnect)]);
    }
    
} else if ($userType === 'staff') {
    $checkSql = "SELECT EmployeeID FROM employee WHERE EmployeeEmail = '$email'";
    $checkResult = mysqli_query($dbconnect, $checkSql);
    
    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered as staff']);
        mysqli_close($dbconnect);
        exit;
    }
    
    $nextId = generateNextId($dbconnect, 'employee', 'E', 'EmployeeID');
    
    $sql = "INSERT INTO employee (EmployeeID, EmployeeName, EmployeeEmail, EmployeePassword, empDOB, empAddress, EmployeePhone, empHiredDate) 
            VALUES ('$nextId', '$name', '$email', '$hashedPassword', '$dob', '$address', '$phone', '$hiredDate')";
    
    $result = mysqli_query($dbconnect, $sql);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Staff registered successfully!',
            'userType' => 'staff',
            'userId' => $nextId,
            'name' => $name,
            'email' => $email
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to register: ' . mysqli_error($dbconnect)]);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
}

mysqli_close($dbconnect);
?>