const API_URL = '../WanWorkSpace/api/';
const STOCK_URL = '../WanWorkSpace/stock/';
const ORDER_URL = '../WanWorkSpace/order/';
const FEEDBACK_URL = '../WanWorkSpace/feedback/';

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
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error. Make sure XAMPP is running.');
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
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Register error:', error);
            alert('Network error.');
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

function confirmAddToCart() {
    const sizeEl = document.getElementById('modalSize');
    const colourEl = document.getElementById('modalColour');
    const size = sizeEl ? sizeEl.value : '';
    const colour = colourEl ? colourEl.value : '';

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existing = cart.find(item => item.id === _modalItemId && item.size === size && item.colour === colour);
    if (existing) {
        existing.qty += _modalQty;
    } else {
        cart.push({ id: _modalItemId, name: _modalItemName, price: _modalItemPrice, qty: _modalQty, size, colour });
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    const modalEl = document.getElementById('cartModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    alert(_modalItemName + ' (x' + _modalQty + ') added to cart!');
}

// ---------------- PRODUCTS ----------------
async function loadProducts(category) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center"><p>Loading products...</p></div>';

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
                const card = document.createElement('div');
                card.className = 'col-lg-4 col-md-6';
                card.innerHTML = `
                    <div class="product-card">
                        <div class="product-img">
                            <span style="font-size:3rem;">&#128255;</span>
                        </div>
                        <h4>${p.StockName}</h4>
                        <p>Premium quality item. Stock: ${p.StockQuantity}</p>
                        <h5>RM ${price}</h5>
                        <button class="btn btn-warning w-100" onclick="openCartModal('${p.StockID}', '${p.StockName}', ${price})">Add to Cart</button>
                    </div>
                `;
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

// ---------------- CART ----------------

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
    tableBody.innerHTML = '';
    cart.forEach(item => {
        const total = item.price * item.qty;
        subtotal += total;
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.size || '-'}</td>
                <td>${item.colour || '-'}</td>
                <td>${item.qty}</td>
                <td>RM ${item.price.toFixed(2)}</td>
                <td>RM ${total.toFixed(2)}</td>
            </tr>
        `;
    });

    const tax = subtotal * 0.10;
    const grandTotal = subtotal + tax;
    localStorage.setItem('cartTotal', grandTotal.toFixed(2));

    summary.innerHTML = `
        <h4>Cart Summary</h4>
        <p><strong>Subtotal:</strong> RM ${subtotal.toFixed(2)}</p>
        <p><strong>Tax (10%):</strong> RM ${tax.toFixed(2)}</p>
        <h5 id="checkoutTotal">${grandTotal.toFixed(2)}</h5>
        <p><strong>Grand Total:</strong> RM ${grandTotal.toFixed(2)}</p>
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
        alert('Please login first.');
        window.location.href = 'index.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    const deliveryTypeEl = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : 'Pick Up';
    const grandTotal = localStorage.getItem('cartTotal') || '0';

    try {
        // Place one order row per cart item
        let lastOrderId = null;
        for (const item of cart) {
            const response = await fetch(ORDER_URL + 'add_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: currentUser.id,
                    customerName: currentUser.name,
                    orderAmount: (item.price * item.qty).toFixed(2),
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
                alert('Order failed: ' + data.message);
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
        alert('Network error during checkout.');
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
                alert(data.message);
                window.location.href = 'home.html';
            } else {
                alert('Membership failed: ' + data.message);
            }
        } catch (error) {
            console.error('Membership error:', error);
            alert('Network error.');
        }
    });
}

// ---------------- RECEIPT ----------------
function loadReceipt() {
    const orderId = localStorage.getItem('lastOrderId');
    const total = localStorage.getItem('lastOrderTotal');
    const receiptOrderEl = document.getElementById('receiptOrderId');
    const receiptTotalEl = document.getElementById('receiptTotal');
    if (receiptOrderEl && orderId) receiptOrderEl.textContent = '#' + orderId;
    if (receiptTotalEl && total) receiptTotalEl.textContent = 'RM ' + total;
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = document.getElementById('feedbackMessage').value;
        const orderId = localStorage.getItem('lastOrderId');
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (!orderId || !user) {
            alert('Cannot submit feedback: Missing order or user info.');
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
                alert('Thank you! Feedback submitted.');
                const modalEl = document.getElementById('feedbackModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (error) {
            console.error('Feedback error:', error);
            alert('Network error.');
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
                    <td><span class="badge bg-${order.OrderStatus === 'Approved' ? 'success' : 'warning'}">${order.OrderStatus || 'Pending'}</span></td>
                    <td><button class="btn btn-sm btn-success" onclick="approveOrder('${order.OrderID}')" ${order.OrderStatus === 'Approved' ? 'disabled' : ''}>Approve</button></td>
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

async function approveOrder(orderId) {
    if (!confirm('Approve this order?')) return;
    try {
        const response = await fetch(ORDER_URL + 'update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: 'Approved' })
        });
        const data = await response.json();
        if (data.success) {
            alert('Order approved!');
            loadEmployeeOrders();
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Network error.');
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
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.StockCategory}</td>
                    <td>${item.StockName}</td>
                    <td><input type="number" id="price_${item.StockID}" class="form-control" style="width:100px" value="${item.StockPrice}"></td>
                    <td><img src="https://via.placeholder.com/80x80?text=Item" alt="${item.StockName}" style="border-radius:8px;"></td>
                    <td><input type="number" id="qty_${item.StockID}" class="form-control" style="width:100px" value="${item.StockQuantity}"></td>
                    <td><button class="btn btn-sm btn-primary" onclick="updateStock('${item.StockID}')">Save</button></td>
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
            alert('Stock updated!');
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Network error.');
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
});
