<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$conn = mysqli_connect("localhost", "root", "", "bsaoutletdb");

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$userType = $input['userType'] ?? '';
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$address = $input['address'] ?? '';
$phone = $input['phone'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password min 6 characters']);
    exit;
}

$hashedPassword = md5($password);

function generateId($conn, $table, $prefix, $idCol) {
    $result = mysqli_query($conn, "SELECT MAX($idCol) as max FROM $table");
    $row = mysqli_fetch_assoc($result);
    $max = $row['max'];
    if ($max) {
        $num = intval(substr($max, strlen($prefix))) + 1;
        return $prefix . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
    return $prefix . '001';
}

if ($userType === 'customer') {
    $check = mysqli_query($conn, "SELECT CustomerID FROM customer WHERE CustomerEmail = '$email'");
    if (mysqli_num_rows($check) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }
    
    $id = generateId($conn, 'customer', 'C', 'CustomerID');
    $sql = "INSERT INTO customer (CustomerID, CustomerName, CustomerEmail, CustomerPassword, CustomerPhone, IsMember) 
            VALUES ('$id', '$name', '$email', '$hashedPassword', '$phone', 0)";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Customer registered!', 'userId' => $id, 'name' => $name]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . mysqli_error($conn)]);
    }
    
} else if ($userType === 'staff') {
    $check = mysqli_query($conn, "SELECT EmployeeID FROM employee WHERE EmployeeEmail = '$email'");
    if (mysqli_num_rows($check) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }
    
    $id = generateId($conn, 'employee', 'E', 'EmployeeID');
    $sql = "INSERT INTO employee (EmployeeID, EmployeeName, EmployeeEmail, EmployeePassword, EmployeePhone) 
            VALUES ('$id', '$name', '$email', '$hashedPassword', '$phone')";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Staff registered!', 'userId' => $id, 'name' => $name]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . mysqli_error($conn)]);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
}

mysqli_close($conn);
?>