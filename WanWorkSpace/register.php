<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database Connection Error']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$userType = mysqli_real_escape_string($conn, $input['userType'] ?? '');
$name = mysqli_real_escape_string($conn, trim($input['name'] ?? ''));
$email = mysqli_real_escape_string($conn, trim($input['email'] ?? ''));
$passwordInput = mysqli_real_escape_string($conn, $input['password'] ?? '');
$address = mysqli_real_escape_string($conn, $input['address'] ?? '');
$phone = mysqli_real_escape_string($conn, $input['phone'] ?? '');

if (empty($name) || empty($email) || empty($passwordInput)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

if (strlen($passwordInput) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

function generateNextId($conn, $table, $prefix, $idColumn) {
    $sql = "SELECT MAX($idColumn) as max_id FROM $table";
    $result = mysqli_query($conn, $sql);
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
    $checkResult = mysqli_query($conn, $checkSql);
    
    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        mysqli_close($conn);
        exit;
    }
    
    $nextId = generateNextId($conn, 'customer', 'C', 'CustomerID');
    
    $sql = "INSERT INTO customer (CustomerID, CustomerName, CustomerAddress, CustomerEmail, CustomerPassword, CustomerPhone) 
            VALUES ('$nextId', '$name', '$address', '$email', '$passwordInput', '$phone')";
    
    $result = mysqli_query($conn, $sql);
    
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
        echo json_encode(['success' => false, 'message' => 'Failed to register: ' . mysqli_error($conn)]);
    }
    
} else if ($userType === 'staff') {
    $checkSql = "SELECT EmployeeID FROM employee WHERE EmployeeEmail = '$email'";
    $checkResult = mysqli_query($conn, $checkSql);
    
    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered as staff']);
        mysqli_close($conn);
        exit;
    }
    
    $nextId = generateNextId($conn, 'employee', 'E', 'EmployeeID');
    
    $sql = "INSERT INTO employee (EmployeeID, EmployeeName, EmployeeEmail, EmployeePassword, EmpAddress, EmployeePhone) 
            VALUES ('$nextId', '$name', '$email', '$passwordInput', '$address', '$phone')";
    
    $result = mysqli_query($conn, $sql);
    
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
        echo json_encode(['success' => false, 'message' => 'Failed to register: ' . mysqli_error($conn)]);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
}

mysqli_close($conn);
?>