<?php
$db = mysqli_connect('localhost', 'root', '', 'bsa');
$res = mysqli_query($db, 'DESCRIBE stock');
while($row = mysqli_fetch_array($res)) { echo $row['Field'] . ' - ' . $row['Type'] . "\n"; }
?>
