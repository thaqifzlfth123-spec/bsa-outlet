const API_URL = '../WanWorkSpace/api/';
const STOCK_URL = '../WanWorkSpace/stock/';
const ORDER_URL = '../WanWorkSpace/order/';
const FEEDBACK_URL = '../WanWorkSpace/feedback/';

const imageMap = {
    'S001': 'images/menswear/basic_tshirt.jpg',
    'S002': 'images/menswear/oversized_hoodie.jpg',
    'S003': 'images/womenswear/floral_dress.jpg',
    'S004': 'images/kids/kids_tshirt.jpg',
    'S005': 'images/shoes/running_shoes.jpg',
    'S006': 'images/general/placeholder.jpg',
    // New Menswear
    'M001': 'images/menswear/m001_suit.png',
    'M002': 'images/menswear/m002_jacket.png',
    'M003': 'images/menswear/m003_shirt.png',
    'M004': 'images/menswear/m004_chinos.png',
    'M005': 'images/menswear/m005_sweater.png',
    'M006': 'images/menswear/m006_blazer.png',
    // New Womenswear
    'W001': 'images/womenswear/w001_gown.png',
    'W002': 'images/womenswear/w002_blouse.png',
    'W003': 'images/womenswear/w003_trousers.png',
    'W004': 'images/womenswear/w004_coat.png',
    'W005': 'images/womenswear/w005_skirt.png',
    'W006': 'images/womenswear/w006_cardigan.png',
    // New Kids
    'K001': 'images/kids/k001_overalls.png',
    'K002': 'images/kids/k002_tee.png',
    'K003': 'images/kids/k003_puffer.png',
    'K004': 'images/kids/k004_dress.png',
    'K005': 'images/kids/k005_joggers.png',
    'K006': 'images/general/placeholder.jpg',
    // New Shoes
    'SH01': 'images/shoes/running_shoes.jpg',
    'SH02': 'images/shoes/running_shoes.jpg',
    'SH03': 'images/shoes/running_shoes.jpg',
    'SH04': 'images/shoes/running_shoes.jpg',
    'SH05': 'images/shoes/running_shoes.jpg',
    'SH06': 'images/shoes/running_shoes.jpg'
};

// ---------------- HELPERS ----------------
function getSelectedUserType() {
    const customerRadio = document.getElementById('customer');
    if (customerRadio && customerRadio.checked) return 'customer';
    return 'staff';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ---------------- LOGIN ----------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = getSelectedUserType();

        try {
            const response = await fetch(API_URL + 'login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userType })
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify({ type: userType, ...data.user }));
                if (userType === 'customer') {
                    window.location.href = 'home.html';
                } else {
                    window.location.href = 'employee_home.html';
                }
            } else {
                showToast('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error. Make sure XAMPP is running.');
        }
    });
}

// ---------------- REGISTER ----------------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const userType = getSelectedUserType();

        try {
            const response = await fetch(API_URL + 'register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, userType })
            });
            const data = await response.json();
            if (data.success) {
                showToast(data.message);
                window.location.href = 'index.html';
            } else {
                showToast('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Register error:', error);
            showToast('Network error.');
        }
    });
}



// ---------------- CART MODAL ----------------
let _modalItemId = null;
let _modalItemName = null;
let _modalItemPrice = 0;
let _modalQty = 1;

function openCartModal(id, name, price) {
    _modalItemId = id;
    _modalItemName = name;
    _modalItemPrice = parseFloat(price);
    _modalQty = 1;

    document.getElementById('modalItemName').textContent = name;
    document.getElementById('modalItemPrice').textContent = 'RM ' + _modalItemPrice.toFixed(2);
    document.getElementById('modalQty').textContent = _modalQty;
    document.getElementById('modalSubtotal').textContent = 'RM ' + (_modalItemPrice * _modalQty).toFixed(2);

    const modal = new bootstrap.Modal(document.getElementById('cartModal'));
    modal.show();
}

function changeQty(delta) {
    _modalQty = Math.max(1, _modalQty + delta);
    document.getElementById('modalQty').textContent = _modalQty;
    document.getElementById('modalSubtotal').textContent = 'RM ' + (_modalItemPrice * _modalQty).toFixed(2);
}

function addToCart(id, name, price, qty, size, colour) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existing = cart.find(item => item.id === id && item.size === size && item.colour === colour);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id, name, price, qty, size, colour });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    showToast(name + ' (x' + qty + ') added to cart!');
    if (typeof openMiniCart === 'function') openMiniCart();
}

function confirmAddToCart() {
    const sizeEl = document.getElementById('modalSize');
    const colourEl = document.getElementById('modalColour');
    const size = sizeEl ? sizeEl.value : '';
    const colour = colourEl ? colourEl.value : '';

    if (sizeEl && !size) {
        showToast("⚠️ Please select a Size before adding to cart.");
        return;
    }
    
    if (colourEl && !colour) {
        showToast("⚠️ Please select a Colour before adding to cart.");
        return;
    }

    addToCart(_modalItemId, _modalItemName, _modalItemPrice, _modalQty, size, colour);

    const modalEl = document.getElementById('cartModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
}

// ---------------- PRODUCTS ----------------
async function loadProducts(category) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="col-lg-4 col-md-6"><div class="skeleton skeleton-img mb-3"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
        <div class="col-lg-4 col-md-6"><div class="skeleton skeleton-img mb-3"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
        <div class="col-lg-4 col-md-6"><div class="skeleton skeleton-img mb-3"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
    `;

    try {
        const response = await fetch(STOCK_URL + 'get_stock.php');
        const data = await response.json();

        if (data.success && data.stock) {
            const products = data.stock.filter(item => item.StockCategory === category);

            if (products.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No products found for this category.</p></div>';
                return;
            }

            container.innerHTML = '';

            products.forEach(p => {
                const price = parseFloat(p.StockPrice).toFixed(2);
                const imgSrc = p.ImageURL || imageMap[p.StockID] || null;
                const imgHTML = imgSrc
                    ? `<img src="${imgSrc}" alt="${p.StockName}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" onerror="this.style.display='none'">`
                    : `<span style="font-size:3rem;">&#128255;</span>`;
                const card = document.createElement('div');
                card.className = 'col-lg-4 col-md-6';
                card.innerHTML = `
                    <div class="product-card">
                        <div class="product-img position-relative">
                            ${imgHTML}
                            <div class="position-absolute top-50 start-50 translate-middle" style="opacity: 0; transition: 0.3s;" id="qv_btn_${p.StockID}">
                                <button class="btn btn-light shadow" onclick="openQuickView('${p.StockID}', '${p.StockName}', '${price}', '${imgSrc}')">Quick View</button>
                            </div>
                        </div>
                        <div class="product-card-body p-3">
                            <h5 class="mt-3">${p.StockName}</h5>
                            <p class="text-muted">Premium quality item &bull; Stock: ${p.StockQuantity}</p>
                            <h5>RM ${price}</h5>
                            <button class="btn btn-warning w-100" onclick="openCartModal('${p.StockID}', '${p.StockName}', ${price})">Add to Cart</button>
                        </div>
                    </div>
                `;
                // Add hover effect for quick view button
                const imgContainer = card.querySelector('.product-img');
                const qvBtn = card.querySelector(`#qv_btn_${p.StockID}`);
                if(imgContainer && qvBtn) {
                    imgContainer.onmouseenter = () => qvBtn.style.opacity = '1';
                    imgContainer.onmouseleave = () => qvBtn.style.opacity = '0';
                }
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="col-12 text-center"><p>Could not load products.</p></div>';
        }
    } catch (error) {
        console.error('loadProducts error:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger"><p>Error: Could not connect to the server. Make sure XAMPP is running.</p></div>';
    }
}

function filterProducts() {
    const searchInput = document.getElementById('productSearchInput');
    if (!searchInput) return;
    
    const term = searchInput.value.toLowerCase();
    const container = document.getElementById('productsContainer');
    const cards = container.querySelectorAll('.col-lg-4');
    
    cards.forEach(card => {
        const title = card.querySelector('.product-card-body h5');
        if (title) {
            const match = title.textContent.toLowerCase().includes(term);
            card.style.display = match ? 'block' : 'none';
        }
    });
}

// ---------------- CART ----------------

function toggleDeliveryOptions() {
    const isDelivery = document.getElementById('delivery') && document.getElementById('delivery').checked;
    const container = document.getElementById('deliveryRegionContainer');
    if (container) {
        container.style.display = isDelivery ? 'block' : 'none';
    }
    loadCart();
}

function loadCart() {
    const tableBody = document.getElementById('cartTableBody');
    const summary = document.getElementById('cartSummary');
    if (!tableBody || !summary) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const infoBox = document.getElementById('customerInfoBox');
    if (infoBox) {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB');
        const nameSpan = infoBox.querySelector('p');
        if (nameSpan) {
            nameSpan.innerHTML = currentUser
                ? `<strong>Customer:</strong> ${currentUser.name}`
                : `<strong>Customer:</strong> Guest (Please login)`;
        }
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Your cart is empty.</td></tr>';
        summary.innerHTML = '<h4>Cart Summary</h4><p><strong>Grand Total:</strong> RM 0.00</p>';
        return;
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const isMember = currentUser && (currentUser.IsMember == 1 || currentUser.IsMember === '1' || currentUser.IsMember === true);

    tableBody.innerHTML = '';
    cart.forEach(item => {
        let price = item.price;
        let discountPerItem = 0;
        
        if (isMember) {
            discountPerItem = Math.min(10, price);
            price = price - discountPerItem;
        }
        
        const itemTotal = price * item.qty;
        subtotal += itemTotal;
        totalDiscount += (discountPerItem * item.qty);

        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.size || '-'}</td>
                <td>${item.colour || '-'}</td>
                <td>${item.qty}</td>
                <td>
                    ${discountPerItem > 0 ? `<del class="text-muted" style="font-size:0.8rem">RM ${item.price.toFixed(2)}</del><br>` : ''}
                    RM ${price.toFixed(2)}
                </td>
                <td>RM ${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    const tax = subtotal * 0.10;
    let deliveryFee = 0;
    const isDelivery = document.getElementById('delivery') && document.getElementById('delivery').checked;
    if (isDelivery) {
        const regionEl = document.getElementById('deliveryRegion');
        if (regionEl) {
            deliveryFee = parseFloat(regionEl.value);
        }
    }

    const grandTotal = subtotal + tax + deliveryFee;
    localStorage.setItem('cartTotal', grandTotal.toFixed(2));
    localStorage.setItem('membershipDiscount', totalDiscount.toFixed(2));

    let discountHtml = '';
    if (totalDiscount > 0) {
        discountHtml = `<p class="text-success mb-1"><strong>Member Savings:</strong> -RM ${totalDiscount.toFixed(2)}</p>`;
    }
    
    let deliveryHtml = '';
    if (isDelivery) {
        deliveryHtml = `<p class="mb-1"><strong>Delivery Fee:</strong> RM ${deliveryFee.toFixed(2)}</p>`;
    }

    summary.innerHTML = `
        <h4>Cart Summary</h4>
        <p class="mb-1"><strong>Subtotal:</strong> RM ${subtotal.toFixed(2)}</p>
        ${discountHtml}
        <p class="mb-1"><strong>Tax (10%):</strong> RM ${tax.toFixed(2)}</p>
        ${deliveryHtml}
        <hr>
        <h5 id="checkoutTotal">RM ${grandTotal.toFixed(2)}</h5>
    `;
}

function clearCart() {
    if (confirm('Clear your cart?')) {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTotal');
        loadCart();
    }
}

async function checkout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showToast('Please login first.');
        window.location.href = 'index.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showToast('Your cart is empty.');
        return;
    }

    const deliveryTypeEl = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : 'Pick Up';
    const grandTotal = localStorage.getItem('cartTotal') || '0';

    try {
        const isMember = currentUser && (currentUser.IsMember == 1 || currentUser.IsMember === '1' || currentUser.IsMember === true);

        // Place one order row per cart item
        let lastOrderId = null;
        let isFirstItem = true;
        
        let subtotal = 0;
        cart.forEach(item => {
            let p = item.price;
            if (isMember) p -= Math.min(10, p);
            subtotal += (p * item.qty);
        });
        const tax = subtotal * 0.10;
        const deliveryFee = grandTotal - subtotal - tax;

        for (const item of cart) {
            let price = item.price;
            if (isMember) {
                price = price - Math.min(10, price);
            }
            let orderAmount = (price * item.qty);
            
            // Add tax and delivery to the first item so DB totals match what customer paid
            if (isFirstItem) {
                orderAmount += tax + deliveryFee;
                isFirstItem = false;
            }
            orderAmount = orderAmount.toFixed(2);

            const response = await fetch(ORDER_URL + 'add_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: currentUser.id,
                    customerName: currentUser.name,
                    orderAmount: orderAmount,
                    stockId: item.id,
                    quantity: item.qty,
                    size: item.size || '',
                    colour: item.colour || '',
                    deliveryType: deliveryType,
                    employeeId: 'E001',
                    employeeName: 'Admin Staff',
                    employeeAddress: '123 St'
                })
            });
            const data = await response.json();
            if (data.success) {
                lastOrderId = data.orderId;
            } else {
                showToast('Order failed: ' + data.message);
                return;
            }
        }

        localStorage.setItem('lastOrderId', lastOrderId);
        localStorage.setItem('lastOrderTotal', grandTotal);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTotal');
        window.location.href = 'receipt.html';

    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Network error during checkout.');
    }
}

// ---------------- MEMBERSHIP ----------------
const memberForm = document.getElementById('memberForm');
if (memberForm) {
    memberForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;

        try {
            const response = await fetch(API_URL + 'membership.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, level: 'Premium' })
            });
            const data = await response.json();
            if (data.success) {
                showToast(data.message);
                window.location.href = 'home.html';
            } else {
                showToast('Membership failed: ' + data.message);
            }
        } catch (error) {
            console.error('Membership error:', error);
            showToast('Network error.');
        }
    });
}

// ---------------- RECEIPT ----------------
async function loadReceipt() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryOrderId = urlParams.get('orderId');
    
    const receiptOrderEl = document.getElementById('receiptOrderId');
    const receiptTotalEl = document.getElementById('receiptTotal');
    const receiptDiscountEl = document.getElementById('receiptDiscount');

    if (queryOrderId) {
        // Staff viewing receipt from URL
        try {
            const response = await fetch(ORDER_URL + 'get_order_by_id.php?orderId=' + queryOrderId);
            const data = await response.json();
            
            if (data.success && data.order) {
                if (receiptOrderEl) receiptOrderEl.textContent = '#' + data.order.OrderID;
                if (receiptTotalEl) receiptTotalEl.textContent = 'RM ' + data.order.OrderAmount;
                
                // If the staff is viewing, we don't know the exact discount applied historically easily without original price, 
                // but we hide the feedback popup.
                if (receiptDiscountEl && data.order.IsMember === '1') {
                    receiptDiscountEl.innerHTML = `<div class="receipt-line text-success"><span>Member Discount:</span><span>Applied</span></div>`;
                }
                
                // Also hide the feedback button in HTML since staff is viewing
                const feedbackBtn = document.querySelector('[data-bs-target="#feedbackModal"]');
                if (feedbackBtn) feedbackBtn.style.display = 'none';
            } else {
                showToast('Failed to load receipt data.');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        // Customer viewing receipt right after checkout
        const orderId = localStorage.getItem('lastOrderId');
        const total = localStorage.getItem('lastOrderTotal');
        const discount = localStorage.getItem('membershipDiscount');
        
        if (receiptOrderEl && orderId) receiptOrderEl.textContent = '#' + orderId;
        if (receiptTotalEl && total) receiptTotalEl.textContent = 'RM ' + total;
        
        if (receiptDiscountEl && discount && parseFloat(discount) > 0) {
            receiptDiscountEl.innerHTML = `<div class="receipt-line text-success"><span>Member Savings:</span><span>-RM ${parseFloat(discount).toFixed(2)}</span></div>`;
        }

        // Auto popup feedback modal after 1.5 seconds for customers
        setTimeout(() => {
            const fbModalEl = document.getElementById('feedbackModal');
            if(fbModalEl) {
                const modal = new bootstrap.Modal(fbModalEl);
                modal.show();
            }
        }, 1500);
    }
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = document.getElementById('feedbackMessage').value;
        const orderId = localStorage.getItem('lastOrderId');
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (!orderId || !user) {
            showToast('Cannot submit feedback: Missing order or user info.');
            return;
        }

        try {
            const response = await fetch(FEEDBACK_URL + 'add_feedback.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: user.id, orderId, message })
            });
            const data = await response.json();
            if (data.success) {
                showToast('Thank you! Feedback submitted.');
                const modalEl = document.getElementById('feedbackModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            } else {
                showToast('Failed: ' + data.message);
            }
        } catch (error) {
            console.error('Feedback error:', error);
            showToast('Network error.');
        }
    });
}

// ---------------- EMPLOYEE: ORDERS ----------------
async function loadEmployeeOrders() {
    const tbody = document.getElementById('employeeOrderTableBody');
    if (!tbody) return;

    try {
        const response = await fetch(ORDER_URL + 'get_orders.php');
        const data = await response.json();

        if (data.success && data.orders && data.orders.length > 0) {
            tbody.innerHTML = '';
            data.orders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${order.OrderID}</td>
                    <td>${order.CustomerID}</td>
                    <td>${order.CustomerName || 'N/A'}</td>
                    <td>${order.CustomerEmail || 'N/A'}</td>
                    <td>${order.CustomerPhone || 'N/A'}</td>
                    <td>${order.StockName || 'N/A'}</td>
                    <td>${order.StockCategory || 'N/A'}</td>
                    <td>${order.Quantity || 1}</td>
                    <td>${order.Size || 'N/A'}</td>
                    <td>${order.Colour || 'N/A'}</td>
                    <td>RM ${order.OrderAmount}</td>
                    <td>${order.DeliveryType || 'N/A'}</td>
                    <td>
                        <span class="badge bg-${
                            order.OrderStatus === 'Delivered' ? 'success' : 
                            order.OrderStatus === 'Shipped' ? 'info' : 
                            order.OrderStatus === 'Approved' ? 'primary' : 
                            order.OrderStatus === 'Cancelled' ? 'danger' : 'warning'
                        }">${order.OrderStatus || 'Pending'}</span>
                    </td>
                    <td>
                        <div class="input-group input-group-sm mb-1">
                            <select class="form-select" id="status_${order.OrderID}">
                                <option value="Pending" ${order.OrderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Approved" ${order.OrderStatus === 'Approved' ? 'selected' : ''}>Approved</option>
                                <option value="Shipped" ${order.OrderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${order.OrderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${order.OrderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <button class="btn btn-outline-dark" onclick="updateOrderStatus('${order.OrderID}')">Update</button>
                        </div>
                        <div class="d-flex gap-1 mt-1">
                            <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="window.open('receipt.html?orderId=${order.OrderID}', '_blank')">View Receipt</button>
                            <button class="btn btn-sm btn-outline-danger flex-grow-1" onclick="deleteOrder('${order.OrderID}')">Delete</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="14" class="text-center">No orders found.</td></tr>';
        }
    } catch (error) {
        console.error('loadEmployeeOrders error:', error);
        tbody.innerHTML = '<tr><td colspan="14" class="text-center text-danger">Failed to load orders.</td></tr>';
    }
}

async function updateOrderStatus(orderId) {
    const status = document.getElementById('status_' + orderId).value;
    if (!confirm(`Are you sure you want to change order ${orderId} status to ${status}?`)) return;
    
    try {
        const response = await fetch(ORDER_URL + 'update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Order status updated successfully!');
            loadEmployeeOrders();
        } else {
            showToast('Failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        showToast('Network error.');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to completely delete order ' + orderId + '? This cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(ORDER_URL + 'delete_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Order deleted successfully!');
            loadEmployeeOrders();
        } else {
            showToast('Failed to delete order: ' + data.message);
        }
    } catch (error) {
        console.error('deleteOrder error:', error);
        showToast('Network error.');
    }
}

// ---------------- EMPLOYEE: STOCK ----------------
async function loadEmployeeStock() {
    const tbody = document.getElementById('employeeStockTableBody');
    if (!tbody) return;

    try {
        const response = await fetch(STOCK_URL + 'get_stock.php');
        const data = await response.json();

        if (data.success && data.stock) {
            tbody.innerHTML = '';
            data.stock.forEach(item => {
                const imgSrc = imageMap[item.StockID] || 'images/general/placeholder.jpg';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.StockCategory}</td>
                    <td>${item.StockName}</td>
                    <td><input type="number" id="price_${item.StockID}" class="form-control" style="width:100px" value="${item.StockPrice}"></td>
                    <td><img src="${imgSrc}" alt="${item.StockName}" class="stock-img"></td>
                    <td><input type="number" id="qty_${item.StockID}" class="form-control" style="width:100px" value="${item.StockQuantity}"></td>
                    <td>
                        <button class="btn btn-sm btn-primary mb-1 w-100" onclick="updateStock('${item.StockID}')">Save</button>
                        <button class="btn btn-sm btn-outline-danger w-100" onclick="deleteStock('${item.StockID}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No stock found.</td></tr>';
        }
    } catch (error) {
        console.error('loadEmployeeStock error:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load stock.</td></tr>';
    }
}

async function updateStock(stockId) {
    const quantity = document.getElementById('qty_' + stockId).value;
    const price = document.getElementById('price_' + stockId).value;

    try {
        const response = await fetch(STOCK_URL + 'update_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stockId, quantity, price })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Stock updated!');
        } else {
            showToast('Failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        showToast('Network error.');
    }
}

async function addNewStock(event) {
    event.preventDefault();
    const name = document.getElementById('newStockName').value;
    const category = document.getElementById('newStockCategory').value;
    const price = document.getElementById('newStockPrice').value;
    const quantity = document.getElementById('newStockQty').value;

    try {
        const response = await fetch(STOCK_URL + 'add_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, price, quantity })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Item added successfully! Note: The new item will use a placeholder image until mapped.');
            // close modal
            const modalEl = document.getElementById('addStockModal');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            // reset form
            document.getElementById('addStockForm').reset();
            // reload table
            loadEmployeeStock();
        } else {
            showToast('Failed to add item: ' + data.message);
        }
    } catch (error) {
        console.error('Add stock error:', error);
        showToast('Network error.');
    }
}

async function deleteStock(stockId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(STOCK_URL + 'delete_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stockId })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Item deleted successfully!');
            loadEmployeeStock();
        } else {
            showToast('Failed to delete: ' + data.message);
        }
    } catch (error) {
        console.error('deleteStock error:', error);
        showToast('Network error.');
    }
}

// ---------------- CUSTOMER: ORDER HISTORY ----------------
async function loadCustomerOrders() {
    const container = document.getElementById('customerOrdersContainer');
    if (!container) return;

    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h4>Please sign in to view your orders.</h4>
                <a href="index.html" class="btn btn-dark mt-3">Sign In</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(ORDER_URL + 'get_customer_orders.php?customerId=' + customerId);
        const data = await response.json();

        if (data.success && data.orders && data.orders.length > 0) {
            container.innerHTML = '';
            data.orders.forEach(order => {
                const badgeClass = 
                    order.OrderStatus === 'Delivered' ? 'success' : 
                    order.OrderStatus === 'Shipped' ? 'info' : 
                    order.OrderStatus === 'Approved' ? 'primary' : 
                    order.OrderStatus === 'Cancelled' ? 'danger' : 'warning';
                    
                const imgSrc = imageMap[order.StockID] || 'images/general/placeholder.jpg';
                
                container.innerHTML += `
                    <div class="order-card d-flex gap-4 align-items-center">
                        <img src="${imgSrc}" alt="${order.StockName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                        <div class="flex-grow-1">
                            <div class="order-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-1">${order.StockName}</h5>
                                    <div class="order-meta">Order ID: #${order.OrderID} • Placed on ${order.OrderDate}</div>
                                </div>
                                <span class="badge bg-${badgeClass} fs-6">${order.OrderStatus || 'Pending'}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <div class="order-meta">Quantity: ${order.Quantity} • Size: ${order.Size} • Color: ${order.Colour}</div>
                                </div>
                                <div class="order-total text-end">
                                    RM ${order.OrderAmount}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <span style="font-size: 3rem;">🛍️</span>
                    <h4 class="mt-3">No orders yet</h4>
                    <p class="text-muted">When you place an order, it will appear here.</p>
                    <a href="menswear.html" class="btn btn-dark mt-3 px-4">Start Shopping</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('loadCustomerOrders error:', error);
        container.innerHTML = '<p class="text-center text-danger">Failed to load orders. Please try again later.</p>';
    }
}

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('menswear.html'))   loadProducts('Menswear');
    if (path.includes('womenswear.html')) loadProducts('Womenswear');
    if (path.includes('kids.html'))       loadProducts('Kids');
    if (path.includes('shoe.html'))       loadProducts('Shoe');
    if (path.includes('cart.html'))       loadCart();
    if (path.includes('receipt.html'))    loadReceipt();
    if (path.includes('order_details.html'))  loadEmployeeOrders();
    if (path.includes('stock_details.html'))  loadEmployeeStock();
    if (path.includes('order_history.html'))  loadCustomerOrders();
    if (path.includes('feedback_dashboard.html')) loadFeedbackDashboard();
    
    injectUXComponents();
    
    // Check Dark Mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeIcon');
        if (icon) icon.textContent = '☀️';
    }
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    
    const icons = document.querySelectorAll('#darkModeIcon');
    icons.forEach(icon => {
        icon.textContent = isDark ? '☀️' : '🌓';
    });
}

// ==========================================
// FEEDBACK DASHBOARD
// ==========================================

async function loadFeedbackDashboard() {
    const container = document.getElementById('feedbackContainer');
    if (!container) return;

    try {
        const response = await fetch(FEEDBACK_URL + 'get_feedback.php');
        const data = await response.json();

        if (data.success && data.feedbacks && data.feedbacks.length > 0) {
            container.innerHTML = '';
            data.feedbacks.forEach(f => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm" style="border-radius: 12px;">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="badge bg-dark">${f.OrderID}</span>
                                <small class="text-muted">${f.FeedbackDate}</small>
                            </div>
                            <h6 class="fw-bold mb-3">${f.CustomerName || 'Customer ' + f.CustomerID}</h6>
                            <p class="text-muted fst-italic">"${f.Message}"</p>
                        </div>
                        <div class="card-footer bg-white border-0 px-4 pb-4 pt-0">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="window.open('receipt.html?orderId=${f.OrderID}', '_blank')">View Receipt</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-muted">No feedback found.</h5></div>';
        }
    } catch (error) {
        console.error('loadFeedbackDashboard error:', error);
        container.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-danger">Failed to load feedback.</h5></div>';
    }
}

// ==========================================
// UX IMPROVEMENTS (Toasts, Offcanvas, Modals)
// ==========================================

function injectUXComponents() {
    // 1. Toast Container
    const toastHTML = `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
        <div id="liveToast" class="toast align-items-center text-bg-dark border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>`;
    
    // 2. Mini Cart Offcanvas
    const miniCartHTML = `
    <div class="offcanvas offcanvas-end" tabindex="-1" id="miniCartOffcanvas" aria-labelledby="miniCartLabel">
        <div class="offcanvas-header bg-dark text-white">
            <h5 class="offcanvas-title" id="miniCartLabel" style="font-family: 'Playfair Display', serif;">Your Cart</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column" id="miniCartBody">
            <p>Cart is empty.</p>
        </div>
        <div class="offcanvas-footer p-3 border-top bg-light">
            <a href="cart.html" class="btn btn-dark w-100 py-2">Checkout</a>
        </div>
    </div>`;

    // 3. Quick View Modal
    const quickViewHTML = `
    <div class="modal fade" id="quickViewModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-body p-0">
                    <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" style="z-index:10"></button>
                    <div class="row g-0">
                        <div class="col-md-6">
                            <img src="" id="qvImage" class="img-fluid w-100 h-100 object-fit-cover" style="border-radius: 8px 0 0 8px; min-height: 400px;">
                        </div>
                        <div class="col-md-6 p-5 d-flex flex-column justify-content-center">
                            <h2 id="qvTitle" class="fw-bold mb-2" style="font-family: 'Playfair Display', serif;"></h2>
                            <h4 id="qvPrice" class="text-muted mb-4"></h4>
                            <button class="btn btn-dark py-3" id="qvAddBtn">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // 4. Scroll to Top Button
    const scrollHTML = `
    <div class="scroll-to-top" id="scrollToTopBtn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
        <i class="bi bi-arrow-up">&uarr;</i>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', toastHTML + miniCartHTML + quickViewHTML + scrollHTML);

    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
    }
}

function showToast(message) {
    const toastEl = document.getElementById('liveToast');
    if(toastEl) {
        document.getElementById('toastMessage').innerText = message;
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
    } else {
        alert(message); // fallback
    }
}

function openQuickView(id, name, price, imgSrc) {
    document.getElementById('qvTitle').innerText = name;
    document.getElementById('qvPrice').innerText = 'RM ' + price;
    document.getElementById('qvImage').src = imgSrc;
    
    document.getElementById('qvAddBtn').onclick = () => {
        // Assume default size/color for quick view, or open product modal
        addToCart(id, name, price, 1, 'M', 'Black'); 
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        modal.hide();
        openMiniCart();
    };

    const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
    modal.show();
}

function openMiniCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const body = document.getElementById('miniCartBody');
    if (cart.length === 0) {
        body.innerHTML = '<p class="text-center mt-5">Your cart is empty.</p>';
    } else {
        let html = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.qty;
            total += itemTotal;
            html += `
                <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">Qty: ${item.qty} | Size: ${item.size}</small>
                    </div>
                    <div class="fw-bold">RM ${itemTotal.toFixed(2)}</div>
                </div>
            `;
        });
        html += `<h5 class="mt-auto pt-3 text-end fw-bold">Total: RM ${total.toFixed(2)}</h5>`;
        body.innerHTML = html;
    }
    
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('miniCartOffcanvas'));
    offcanvas.show();
}
