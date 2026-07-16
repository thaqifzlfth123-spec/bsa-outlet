<?php
$db = mysqli_connect('localhost', 'root', '', 'bsa');
$sql = "CREATE TABLE IF NOT EXISTS feedback (
    FeedbackID VARCHAR(10) PRIMARY KEY,
    FeedbackDate DATE,
    OrderID VARCHAR(10),
    CustomerID VARCHAR(10),
    Message TEXT
)";
if (mysqli_query($db, $sql)) {
    echo 'Feedback table created successfully.';
} else {
    echo 'Error creating table: ' . mysqli_error($db);
}
mysqli_close($db);
?>
