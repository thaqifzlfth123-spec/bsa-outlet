<?php
$db = mysqli_connect('localhost', 'root', '', 'bsa');

$imageUpdates = [
    'S001' => 'images/menswear/basic_tshirt.jpg',
    'S002' => 'images/menswear/oversized_hoodie.jpg',
    'S003' => 'images/womenswear/floral_dress.jpg',
    'S004' => 'images/kids/kids_tshirt.jpg',
    'S005' => 'images/shoes/running_shoes.jpg',
    'S006' => 'images/general/placeholder.jpg',
    'M001' => 'images/menswear/m001_suit.png',
    'M002' => 'images/menswear/m002_jacket.png',
    'M003' => 'images/menswear/m003_shirt.png',
    'M004' => 'images/menswear/m004_chinos.png',
    'M005' => 'images/menswear/m005_sweater.png',
    'M006' => 'images/menswear/m006_blazer.png',
    'W001' => 'images/womenswear/w001_gown.png',
    'W002' => 'images/womenswear/w002_blouse.png',
    'W003' => 'images/womenswear/w003_trousers.png',
    'W004' => 'images/womenswear/w004_coat.png',
    'W005' => 'images/womenswear/w005_skirt.png',
    'W006' => 'images/womenswear/w006_cardigan.png',
    'K001' => 'images/kids/k001_overalls.png',
    'K002' => 'images/kids/k002_tee.png',
    'K003' => 'images/kids/k003_puffer.png',
    'K004' => 'images/kids/k004_dress.png',
    'K005' => 'images/kids/k005_joggers.png',
    'K006' => 'images/general/placeholder.jpg',
    'SH01' => 'images/shoes/running_shoes.jpg',
    'SH02' => 'images/shoes/running_shoes.jpg',
    'SH03' => 'images/shoes/running_shoes.jpg',
    'SH04' => 'images/shoes/running_shoes.jpg',
    'SH05' => 'images/shoes/running_shoes.jpg',
    'SH06' => 'images/shoes/running_shoes.jpg'
];

$success = 0;
foreach ($imageUpdates as $id => $url) {
    $urlEscaped = mysqli_real_escape_string($db, $url);
    $sql = "UPDATE stock SET ImageURL = '$urlEscaped' WHERE StockID = '$id'";
    if (mysqli_query($db, $sql)) {
        $success++;
    }
}

echo "Updated ImageURL for $success items in the database.";
mysqli_close($db);
?>
