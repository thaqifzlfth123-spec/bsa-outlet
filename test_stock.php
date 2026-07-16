<?php
$servername = 'localhost';
$serverid = 'root';
$serverpassword = '';
$database = 'bsa';
$dbconnect = mysqli_connect($servername, $serverid, $serverpassword, $database);
if (!$dbconnect) { echo 'Connection failed'; exit; }
$sql = 'SELECT StockID, StockName, StockQuantity, StockCategory, StockPrice FROM stock';
$result = mysqli_query($dbconnect, $sql);
if (!$result) { echo 'MySQL Error: ' . mysqli_error($dbconnect); }
else { echo 'Success'; }
?>
