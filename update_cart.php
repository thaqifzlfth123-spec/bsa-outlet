<?php
$file = 'C:/xampp/htdocs/bsa/frontend/cart.html';
$content = file_get_contents($file);

$oldHtml = '<div class="d-flex gap-4 mb-4">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="deliveryType" id="pickUp" value="Pick Up" checked>
                <label class="form-check-label" for="pickUp">Pick Up</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="deliveryType" id="delivery" value="Delivery">
                <label class="form-check-label" for="delivery">Delivery</label>
            </div>
        </div>';
        
// Normalize line endings for replacement to work
$content = str_replace("\r\n", "\n", $content);
$oldHtml = str_replace("\r\n", "\n", $oldHtml);

$newHtml = '<div class="d-flex gap-4 mb-3">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="deliveryType" id="pickUp" value="Pick Up" checked onchange="toggleDeliveryOptions()">
                <label class="form-check-label" for="pickUp">Pick Up (Free)</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="deliveryType" id="delivery" value="Delivery" onchange="toggleDeliveryOptions()">
                <label class="form-check-label" for="delivery">Delivery</label>
            </div>
        </div>
        
        <div id="deliveryRegionContainer" style="display: none; transition: 0.3s;" class="mb-4 bg-light p-3 rounded">
            <label class="form-label fw-bold">Select Delivery Region</label>
            <select class="form-select mb-2" id="deliveryRegion" onchange="loadCart()">
                <option value="5">Melaka, Johor, Seremban (+ RM 5.00)</option>
                <option value="10">Other Peninsular Malaysia (+ RM 10.00)</option>
                <option value="15">Sabah & Sarawak (+ RM 15.00)</option>
            </select>
            <div class="alert alert-info py-2 px-3 mb-0" style="font-size: 0.85rem;">
                Delivery fees apply based on your region. Melaka/Johor/Seremban: <strong>+RM5</strong>, other Peninsular areas: <strong>+RM10</strong>, Sabah & Sarawak: <strong>+RM15</strong>.
            </div>
        </div>';

$content = str_replace($oldHtml, $newHtml, $content);
file_put_contents($file, $content);
echo "Done";
?>
