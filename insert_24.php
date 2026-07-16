<?php
$db = mysqli_connect('localhost', 'root', '', 'bsa');

$items = [
    // Menswear
    ['M001', 'Menswear', 'Classic Tailored Suit', 599.90],
    ['M002', 'Menswear', 'Premium Leather Jacket', 350.00],
    ['M003', 'Menswear', 'Oxford Cotton Shirt', 120.00],
    ['M004', 'Menswear', 'Slim Fit Chinos', 110.50],
    ['M005', 'Menswear', 'Cashmere Blend Sweater', 210.00],
    ['M006', 'Menswear', 'Linen Summer Blazer', 280.00],
    
    // Womenswear
    ['W001', 'Womenswear', 'Silk Evening Gown', 650.00],
    ['W002', 'Womenswear', 'Chiffon Floral Blouse', 95.00],
    ['W003', 'Womenswear', 'High-Waisted Trousers', 130.00],
    ['W004', 'Womenswear', 'Designer Trench Coat', 420.00],
    ['W005', 'Womenswear', 'Pleated Midi Skirt', 105.00],
    ['W006', 'Womenswear', 'Cashmere Cardigan', 240.00],
    
    // Kids
    ['K001', 'Kids', 'Denim Overalls Set', 85.00],
    ['K002', 'Kids', 'Graphic Cotton Tee', 45.00],
    ['K003', 'Kids', 'Puffer Winter Jacket', 150.00],
    ['K004', 'Kids', 'Party Dress', 95.00],
    ['K005', 'Kids', 'Fleece Jogger Pants', 65.00],
    ['K006', 'Kids', 'Knit Sweater', 75.00],
    
    // Shoe (Category is 'Shoe')
    ['SH01', 'Shoe', 'Classic Leather Oxfords', 320.00],
    ['SH02', 'Shoe', 'Premium Running Sneakers', 250.00],
    ['SH03', 'Shoe', 'Suede Chelsea Boots', 290.00],
    ['SH04', 'Shoe', 'Stiletto Heels', 275.00],
    ['SH05', 'Shoe', 'Casual Canvas Slip-ons', 110.00],
    ['SH06', 'Shoe', 'Designer Loafers', 340.00]
];

$success = 0;
foreach ($items as $item) {
    $id = $item[0];
    $cat = $item[1];
    $name = mysqli_real_escape_string($db, $item[2]);
    $price = $item[3];
    
    // Check if exists
    $check = mysqli_query($db, "SELECT * FROM stock WHERE StockID='$id'");
    if (mysqli_num_rows($check) == 0) {
        $sql = "INSERT INTO stock (StockID, StockName, StockCategory, StockPrice, StockQuantity, ImageURL) 
                VALUES ('$id', '$name', '$cat', $price, 50, '')";
        if (mysqli_query($db, $sql)) $success++;
    }
}

echo "Inserted $success items successfully.";
mysqli_close($db);
?>
