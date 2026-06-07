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
$email = mysqli_real_escape_string($conn, trim($input['email'] ?? ''));
$passwordInput = mysqli_real_escape_string($conn, $input['password'] ?? '');

if (empty($email) || empty($passwordInput)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

if ($userType === 'customer') {
    $sql = "SELECT CustomerID as id, CustomerName as name, CustomerEmail as email, CustomerAddress as address, CustomerPhone as phone
            FROM customer 
            WHERE CustomerEmail = '$email' AND CustomerPassword = '$passwordInput'";
    
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'userType' => 'customer',
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
    
} else if ($userType === 'staff') {
    $sql = "SELECT EmployeeID as id, EmployeeName as name, EmployeeEmail as email 
            FROM employee 
            WHERE EmployeeEmail = '$email' AND EmployeePassword = '$passwordInput'";
    
    $result = mysqli_query($conn, $sql);
    
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'message' => 'Staff login successful!',
            'userType' => 'staff',
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid staff credentials']);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
}

mysqli_close($conn);
?>