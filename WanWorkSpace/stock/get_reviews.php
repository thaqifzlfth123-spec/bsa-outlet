<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['stockID'])) {
    echo json_encode(['success' => false, 'message' => 'Missing stockID']);
    exit;
}

$servername = "localhost";
$serverid = "root";
$serverpassword = "";
$database = "bsa";
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);

$stockID = mysqli_real_escape_string($dbconnect, $_GET['stockID']);

$sql = "SELECT r.ReviewID, r.Rating, r.Comment, r.ReviewDate, c.CustomerName 
        FROM review r 
        LEFT JOIN customer c ON r.CustomerID = c.CustomerID 
        WHERE r.StockID = '$stockID' 
        ORDER BY r.ReviewDate DESC";

$result = mysqli_query($dbconnect, $sql);
$reviews = [];
$totalRating = 0;

while ($row = mysqli_fetch_assoc($result)) {
    $reviews[] = $row;
    $totalRating += (int)$row['Rating'];
}

$averageRating = count($reviews) > 0 ? round($totalRating / count($reviews), 1) : 0;

echo json_encode(['success' => true, 'reviews' => $reviews, 'average' => $averageRating]);
mysqli_close($dbconnect);
?>
