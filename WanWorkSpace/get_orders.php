<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$database = "bsaoutletdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Check if OrderStatus column exists, if not add it
$checkColumn = mysqli_query($conn, "SHOW COLUMNS FROM `order` LIKE 'OrderStatus'");
if (mysqli_num_rows($checkColumn) == 0) {
    mysqli_query($conn, "ALTER TABLE `order` ADD COLUMN OrderStatus varchar(50) DEFAULT 'Pending'");
}

// Get orders with customer name and employee name
$sql = "SELECT o.OrderID, o.OrderDate, o.OrderAmount, o.CustomerID, o.EmployeeID, o.StockID, 
        IFNULL(o.OrderStatus, 'Pending') as OrderStatus,
        c.CustomerName,
        e.EmployeeName
        FROM `order` o
        LEFT JOIN customer c ON o.CustomerID = c.CustomerID
        LEFT JOIN employee e ON o.EmployeeID = e.EmployeeID
        ORDER BY o.OrderDate DESC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Query error: ' . mysqli_error($conn)]);
    mysqli_close($conn);
    exit;
}

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
mysqli_close($conn);
?>