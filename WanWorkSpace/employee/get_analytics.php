<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";

$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

if (!$dbconnect) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$filter = $_GET['filter'] ?? 'all';
$dateCondition = "";

if ($filter === 'today') {
    $dateCondition = "WHERE OrderDate = CURDATE()";
} else if ($filter === 'week') {
    $dateCondition = "WHERE YEARWEEK(OrderDate, 1) = YEARWEEK(CURDATE(), 1)";
} else if ($filter === 'month') {
    $dateCondition = "WHERE YEAR(OrderDate) = YEAR(CURDATE()) AND MONTH(OrderDate) = MONTH(CURDATE())";
}

$analytics = [
    'totalSales' => 0,
    'ordersToday' => 0,
    'totalCustomers' => 0,
    'bestSelling' => []
];

// 1. Total Sales
$sqlSales = "SELECT SUM(OrderAmount) as total FROM `order` $dateCondition";
$resSales = mysqli_query($dbconnect, $sqlSales);
if ($row = mysqli_fetch_assoc($resSales)) {
    $analytics['totalSales'] = $row['total'] ? (float)$row['total'] : 0;
}

// 2. Orders Today
$sqlToday = "SELECT COUNT(*) as count FROM `order` WHERE OrderDate = CURDATE()";
$resToday = mysqli_query($dbconnect, $sqlToday);
if ($row = mysqli_fetch_assoc($resToday)) {
    $analytics['ordersToday'] = (int)$row['count'];
}

// 3. Total Customers
$sqlCust = "SELECT COUNT(*) as count FROM customer";
$resCust = mysqli_query($dbconnect, $sqlCust);
if ($row = mysqli_fetch_assoc($resCust)) {
    $analytics['totalCustomers'] = (int)$row['count'];
}

// 4. Best Selling Products (Top 5)
$joinCondition = $dateCondition ? "AND " . substr($dateCondition, 6) : ""; // Convert WHERE to AND for the join
$sqlBest = "SELECT s.StockName, SUM(o.Quantity) as totalQty 
            FROM `order` o
            JOIN stock s ON o.StockID = s.StockID
            $dateCondition
            GROUP BY o.StockID, s.StockName
            ORDER BY totalQty DESC
            LIMIT 5";
$resBest = mysqli_query($dbconnect, $sqlBest);
while ($row = mysqli_fetch_assoc($resBest)) {
    $analytics['bestSelling'][] = [
        'name' => $row['StockName'],
        'qty'  => (int)$row['totalQty']
    ];
}

echo json_encode(['success' => true, 'analytics' => $analytics]);
mysqli_close($dbconnect);
?>
