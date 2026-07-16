<?php
$servername = 'localhost';
$serverid = 'root';
$serverpassword = '';
$database = 'bsa';
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);
if (!$dbconnect) { echo 'Connection failed'; exit; }
$sql = 'SELECT StockID, StockName, StockCategory FROM stock';
$result = mysqli_query($dbconnect, $sql);
while ($row = mysqli_fetch_assoc($result)) {
    echo $row['StockID'] . ' - ' . $row['StockName'] . ' - ' . $row['StockCategory'] . "\n";
}
?>
