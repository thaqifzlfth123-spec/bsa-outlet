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

    if (typeof loadProductReviews === 'function') {
        loadProductReviews(id);
    }

    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
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

// ---------------- PRODUCTS & FILTERING ----------------
window.allProducts = [];
window.currentCategory = '';

async function loadProducts(category) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    window.currentCategory = category;

    container.innerHTML = '<div class="col-12 text-center"><p>Loading products...</p></div>';

    try {
        const response = await fetch(STOCK_URL + 'get_stock.php');
        const data = await response.json();

        if (data.success && data.stock) {
            window.allProducts = data.stock.filter(item => item.StockCategory === category);
            renderProducts(window.allProducts);
        } else {
            container.innerHTML = '<div class="col-12 text-center"><p>Could not load products.</p></div>';
        }
    } catch (error) {
        console.error('loadProducts error:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger"><p>Error: Could not connect to the server.</p></div>';
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No products found matching your criteria.</p></div>';
        return;
    }

    container.innerHTML = '';
    products.forEach(p => {
        const price = parseFloat(p.StockPrice).toFixed(2);
        const imgHTML = p.ImageURL 
            ? `<img src="${p.ImageURL}" alt="${p.StockName}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">` 
            : `<span style="font-size:3rem;">&#128255;</span>`;
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6';
        card.innerHTML = `
            <div class="product-card">
                <div class="product-img">
                    ${imgHTML}
                </div>
                <h4>${p.StockName}</h4>
                <p>Premium quality item. Stock: ${p.StockQuantity}</p>
                <h5>RM ${price}</h5>
                <button class="btn btn-warning w-100" onclick="openCartModal('${p.StockID}', '${p.StockName}', ${price})">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const priceRange = document.getElementById('priceRange');
    if (!searchInput || !priceRange) return;

    const searchTerm = searchInput.value.toLowerCase();
    const maxPrice = parseFloat(priceRange.value);

    const filtered = window.allProducts.filter(p => {
        const matchesSearch = p.StockName.toLowerCase().includes(searchTerm);
        const matchesPrice = parseFloat(p.StockPrice) <= maxPrice;
        return matchesSearch && matchesPrice;
    });

    renderProducts(filtered);
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const priceRange = document.getElementById('priceRange');
    if (searchInput) searchInput.value = '';
    if (priceRange) {
        priceRange.value = 500;
        document.getElementById('priceVal').textContent = 500;
    }
    renderProducts(window.allProducts);
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
                let currentStatus = order.OrderStatus || 'Pending';
                let badgeClass = 'warning';
                let nextStatus = 'Processing';
                let nextBtnClass = 'info';
                
                if (currentStatus === 'Processing') {
                    badgeClass = 'info';
                    nextStatus = 'Shipped';
                    nextBtnClass = 'primary';
                } else if (currentStatus === 'Shipped') {
                    badgeClass = 'primary';
                    nextStatus = 'Delivered';
                    nextBtnClass = 'success';
                } else if (currentStatus === 'Delivered') {
                    badgeClass = 'success';
                    nextStatus = null;
                }

                let actionHtml = nextStatus 
                    ? `<button class="btn btn-sm btn-${nextBtnClass} w-100" onclick="advanceOrderStatus('${order.OrderID}', '${nextStatus}')">Mark ${nextStatus}</button>` 
                    : `<span class="badge bg-success w-100 p-2">✓ Complete</span>`;

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
                    <td><span class="badge bg-${badgeClass} p-2 w-100">${currentStatus}</span></td>
                    <td>${actionHtml}</td>
                `;
                tbody.appendChild(tr);
            });
            // Initialize DataTable
            if ($.fn.DataTable.isDataTable('#orderTable')) {
                $('#orderTable').DataTable().destroy();
            }
            $('#orderTable').DataTable({
                dom: 'Bfrtip',
                buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                order: [[0, 'desc']] // Sort by OrderID descending by default
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="14" class="text-center">No orders found.</td></tr>';
        }
    } catch (error) {
        console.error('loadEmployeeOrders error:', error);
        tbody.innerHTML = '<tr><td colspan="14" class="text-center text-danger">Failed to load orders.</td></tr>';
    }
}

async function advanceOrderStatus(orderId, nextStatus) {
    if (!confirm(`Mark order ${orderId} as ${nextStatus}?`)) return;
    try {
        const response = await fetch(ORDER_URL + 'update_order_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: nextStatus })
        });
        const data = await response.json();
        if (data.success) {
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
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#stockTable')) {
                $('#stockTable').DataTable().destroy();
            }
            tbody.innerHTML = '';
            data.stock.forEach(item => {
                const tr = document.createElement('tr');
                const imgSrc = item.ImageURL ? item.ImageURL : 'https://via.placeholder.com/80x80?text=Item';
                tr.innerHTML = `
                    <td>${item.StockCategory}</td>
                    <td>${item.StockName}</td>
                    <td><input type="number" id="price_${item.StockID}" class="form-control" style="width:100px; margin:auto;" value="${item.StockPrice}"></td>
                    <td><img src="${imgSrc}" alt="${item.StockName}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;"></td>
                    <td><input type="number" id="qty_${item.StockID}" class="form-control" style="width:100px; margin:auto;" value="${item.StockQuantity}"></td>
                    <td><button class="btn btn-sm btn-primary" onclick="updateStock('${item.StockID}')">Save</button></td>
                `;
                tbody.appendChild(tr);
            });
            // Initialize DataTable
            $('#stockTable').DataTable({
                dom: 'Bfrtip',
                buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
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
            loadEmployeeStock();
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Network error.');
    }
}

// Handle Add Product Form Submission
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('newStockName').value;
        const category = document.getElementById('newStockCategory').value;
        const price = document.getElementById('newStockPrice').value;
        const quantity = document.getElementById('newStockQty').value;
        const imageUrl = document.getElementById('newStockImg').value;

        try {
            const response = await fetch(STOCK_URL + 'add_stock.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockName: name, stockCategory: category, stockPrice: price, stockQuantity: quantity, imageUrl: imageUrl })
            });
            const data = await response.json();
            if (data.success) {
                alert('Product added successfully!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
                addProductForm.reset();
                loadEmployeeStock();
            } else {
                alert('Failed to add product: ' + data.message);
            }
        } catch (error) {
            console.error('Add stock error:', error);
            alert('Network error while adding stock.');
        }
    });
}

// ---------------- EMPLOYEE: ANALYTICS ----------------
let salesChartInstance = null;

async function loadAnalytics(filter = 'all') {
    const totalSalesEl = document.getElementById('totalSalesVal');
    const ordersTodayEl = document.getElementById('ordersTodayVal');
    const totalCustEl = document.getElementById('totalCustomersVal');
    const chartCtx = document.getElementById('salesChart');
    if (!totalSalesEl || !chartCtx) return;

    try {
        const response = await fetch(`../WanWorkSpace/employee/get_analytics.php?filter=${filter}`);
        const data = await response.json();
        
        if (data.success) {
            totalSalesEl.textContent = 'RM ' + data.analytics.totalSales.toFixed(2);
            ordersTodayEl.textContent = data.analytics.ordersToday;
            totalCustEl.textContent = data.analytics.totalCustomers;
            
            if (salesChartInstance) {
                salesChartInstance.destroy();
            }

            if (data.analytics.bestSelling.length > 0) {
                const labels = data.analytics.bestSelling.map(item => item.name);
                const quantities = data.analytics.bestSelling.map(item => item.qty);
                
                salesChartInstance = new Chart(chartCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Items Sold',
                            data: quantities,
                            backgroundColor: 'rgba(251, 191, 36, 0.8)',
                            borderColor: 'rgba(251, 191, 36, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            } else {
                if(chartCtx.parentElement.querySelector('.no-data-msg')) {
                    chartCtx.parentElement.querySelector('.no-data-msg').remove();
                }
                chartCtx.parentElement.insertAdjacentHTML('beforeend', '<p class="text-center text-muted no-data-msg mt-3">No sales data for this period.</p>');
            }
        }
    } catch (error) {
        console.error('loadAnalytics error:', error);
    }
}

async function loadLowStockAlerts() {
    const alertsContainer = document.getElementById('lowStockAlerts');
    if (!alertsContainer) return;

    try {
        const response = await fetch('../WanWorkSpace/stock/get_stock.php');
        const data = await response.json();
        if (data.success && data.stock) {
            const lowStockItems = data.stock.filter(item => parseInt(item.StockQuantity) < 5);
            if (lowStockItems.length > 0) {
                let alertHtml = `<div class="alert alert-danger shadow-sm border-0" role="alert">
                                    <h5 class="alert-heading">⚠️ Low Stock Alerts!</h5>
                                    <ul class="mb-0">`;
                lowStockItems.forEach(item => {
                    alertHtml += `<li><strong>${item.StockName}</strong> only has ${item.StockQuantity} left in stock!</li>`;
                });
                alertHtml += `</ul></div>`;
                alertsContainer.innerHTML = alertHtml;
            } else {
                alertsContainer.innerHTML = '';
            }
        }
    } catch (error) {
        console.error('loadLowStockAlerts error:', error);
    }
}

// Event Listeners for Dashboard
const analyticsFilter = document.getElementById('analyticsFilter');
if (analyticsFilter) {
    analyticsFilter.addEventListener('change', function(e) {
        loadAnalytics(e.target.value);
    });
}

// ---------------- EMPLOYEE: FEEDBACK ----------------
async function loadFeedback() {
    const tbody = document.getElementById('employeeFeedbackTableBody');
    if (!tbody) return;

    try {
        const response = await fetch(FEEDBACK_URL + 'get_feedback.php');
        const data = await response.json();

        if (data.success && data.feedback && data.feedback.length > 0) {
            tbody.innerHTML = '';
            data.feedback.forEach(f => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${f.FeedbackID}</td>
                    <td>${f.FeedbackDate}</td>
                    <td>${f.OrderID}</td>
                    <td>${f.CustomerName || f.CustomerID}</td>
                    <td style="max-width: 300px; white-space: normal;">${f.Message || '<em>No message</em>'}</td>
                `;
                tbody.appendChild(tr);
            });
            if ($.fn.DataTable.isDataTable('#feedbackTable')) {
                $('#feedbackTable').DataTable().destroy();
            }
            $('#feedbackTable').DataTable({ dom: 'Bfrtip', buttons: ['copy', 'csv', 'excel', 'pdf', 'print'] });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No feedback found.</td></tr>';
        }
    } catch (error) {
        console.error('loadFeedback error:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load feedback.</td></tr>';
    }
}

// ---------------- EMPLOYEE: MEMBERSHIPS ----------------
async function loadCustomers() {
    const tbody = document.getElementById('employeeMembershipTableBody');
    if (!tbody) return;

    try {
        const response = await fetch('../WanWorkSpace/customer/get_customer.php');
        const data = await response.json();

        if (data.success && data.customers && data.customers.length > 0) {
            tbody.innerHTML = '';
            data.customers.forEach(c => {
                const isMemberChecked = c.IsMember == 1 ? 'checked' : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.CustomerID}</td>
                    <td>${c.CustomerName}</td>
                    <td>${c.CustomerEmail || 'N/A'}</td>
                    <td>${c.CustomerPhone || 'N/A'}</td>
                    <td>
                        <div class="form-check form-switch d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" id="isMember_${c.CustomerID}" ${isMemberChecked}>
                        </div>
                    </td>
                    <td>
                        <select class="form-select form-select-sm" id="level_${c.CustomerID}">
                            <option value="Non-Member" ${c.MembershipLevel === 'Non-Member' ? 'selected' : ''}>Non-Member</option>
                            <option value="Standard" ${c.MembershipLevel === 'Standard' ? 'selected' : ''}>Standard</option>
                            <option value="Premium" ${c.MembershipLevel === 'Premium' ? 'selected' : ''}>Premium</option>
                            <option value="VIP" ${c.MembershipLevel === 'VIP' ? 'selected' : ''}>VIP</option>
                        </select>
                    </td>
                    <td><input type="number" id="points_${c.CustomerID}" class="form-control form-control-sm text-center mx-auto" style="width: 80px;" value="${c.Points || 0}"></td>
                    <td><button class="btn btn-sm btn-primary" onclick="updateCustomerMembership('${c.CustomerID}')">Save</button></td>
                `;
                tbody.appendChild(tr);
            });
            if ($.fn.DataTable.isDataTable('#membershipTable')) {
                $('#membershipTable').DataTable().destroy();
            }
            $('#membershipTable').DataTable({ dom: 'Bfrtip', buttons: ['copy', 'csv', 'excel', 'pdf', 'print'] });
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No customers found.</td></tr>';
        }
    } catch (error) {
        console.error('loadCustomers error:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load customers.</td></tr>';
    }
}

async function updateCustomerMembership(customerId) {
    const isMember = document.getElementById('isMember_' + customerId).checked ? 1 : 0;
    const membershipLevel = document.getElementById('level_' + customerId).value;
    const points = document.getElementById('points_' + customerId).value;

    try {
        const response = await fetch('../WanWorkSpace/customer/update_membership.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, isMember, membershipLevel, points })
        });
        const data = await response.json();
        if (data.success) {
            alert('Membership updated!');
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error('updateCustomerMembership error:', error);
        alert('Network error.');
    }
}

// ---------------- CUSTOMER PROFILE & REWARDS ----------------
async function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('profileGreeting').innerText = `Hello, ${currentUser.name}`;

    try {
        const response = await fetch(`../WanWorkSpace/customer/get_customer_details.php?customerID=${currentUser.id}`);
        const data = await response.json();
        if (data.success && data.customer) {
            const c = data.customer;
            const profName = document.getElementById('profName');
            if (profName) {
                profName.value = c.CustomerName || '';
                document.getElementById('profEmail').value = c.CustomerEmail || '';
                document.getElementById('profPhone').value = c.CustomerPhone || '';
                document.getElementById('profAddress').value = c.CustomerAddress || '';
            }

            const rewardLevel = document.getElementById('rewardLevel');
            if (rewardLevel) {
                rewardLevel.innerText = c.MembershipLevel || 'Non-Member';
                document.getElementById('rewardPoints').innerText = c.Points || '0';
                
                let pts = parseInt(c.Points) || 0;
                let percent = 0;
                let nextMsg = "";
                if (c.MembershipLevel === 'Non-Member' || !c.MembershipLevel) {
                    percent = Math.min((pts / 100) * 100, 100);
                    nextMsg = `${Math.max(100 - pts, 0)} points to Standard Member`;
                } else if (c.MembershipLevel === 'Standard') {
                    percent = Math.min((pts / 500) * 100, 100);
                    nextMsg = `${Math.max(500 - pts, 0)} points to Premium Member`;
                } else if (c.MembershipLevel === 'Premium') {
                    percent = Math.min((pts / 1000) * 100, 100);
                    nextMsg = `${Math.max(1000 - pts, 0)} points to VIP`;
                } else {
                    percent = 100;
                    nextMsg = "You are a VIP! Enjoy maximum benefits.";
                }
                if (pts >= 1000) percent = 100;
                document.getElementById('rewardProgress').style.width = percent + '%';
                document.getElementById('rewardNextTier').innerText = nextMsg;
            }
        }
    } catch (err) {
        console.error('loadUserProfile error', err);
    }
}

const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const payload = {
            customerID: currentUser.id,
            name: document.getElementById('profName').value,
            email: document.getElementById('profEmail').value,
            phone: document.getElementById('profPhone').value,
            address: document.getElementById('profAddress').value
        };
        try {
            const response = await fetch('../WanWorkSpace/customer/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert('Profile updated successfully!');
                currentUser.name = payload.name;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('profileGreeting').innerText = `Hello, ${payload.name}`;
            } else {
                alert('Error updating profile: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Network error.');
        }
    });
}

async function loadUserOrders() {
    const tbody = document.getElementById('customerOrdersBody');
    if (!tbody) return;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        const response = await fetch(`../WanWorkSpace/order/get_customer_orders.php?customerID=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success && data.orders && data.orders.length > 0) {
            tbody.innerHTML = '';
            data.orders.forEach(o => {
                let badgeClass = 'secondary';
                if (o.OrderStatus === 'Pending') badgeClass = 'warning';
                if (o.OrderStatus === 'Processing') badgeClass = 'info';
                if (o.OrderStatus === 'Shipped') badgeClass = 'primary';
                if (o.OrderStatus === 'Delivered') badgeClass = 'success';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${o.OrderID}</td>
                        <td>${o.OrderDate}</td>
                        <td>
                            <img src="${o.ImageURL || ''}" width="40" height="40" style="object-fit:cover; border-radius:5px;" class="me-2">
                            ${o.StockName} (x${o.Quantity})
                        </td>
                        <td>RM ${o.OrderAmount}</td>
                        <td><span class="badge bg-${badgeClass}">${o.OrderStatus}</span></td>
                    </tr>
                `;
            });
            if ($.fn.DataTable.isDataTable('#customerOrdersTable')) {
                $('#customerOrdersTable').DataTable().destroy();
            }
            $('#customerOrdersTable').DataTable({ dom: 'rtip' });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
        }
    } catch (error) {
        console.error('loadUserOrders error', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load orders.</td></tr>';
    }
}

// ---------------- PRODUCT REVIEWS ----------------
async function loadProductReviews(stockID) {
    const container = document.getElementById('productReviewsContainer');
    const addReviewSec = document.getElementById('addReviewSection');
    if (!container) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.type === 'customer') {
        addReviewSec.style.display = 'block';
    } else {
        addReviewSec.style.display = 'none';
    }
    
    container.innerHTML = '<p class="text-center text-muted">Loading...</p>';
    try {
        const response = await fetch(`../WanWorkSpace/stock/get_reviews.php?stockID=${stockID}`);
        const data = await response.json();
        if (data.success && data.reviews.length > 0) {
            container.innerHTML = '';
            container.innerHTML += `<div class="mb-2 text-center text-warning fw-bold">Average Rating: ${data.average} ⭐</div>`;
            data.reviews.forEach(r => {
                let stars = '⭐'.repeat(r.Rating);
                container.innerHTML += `
                    <div class="card mb-2 border-0 shadow-sm">
                        <div class="card-body p-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <strong class="small">${r.CustomerName || 'Anonymous'}</strong>
                                <span class="small text-muted">${r.ReviewDate.split(' ')[0]}</span>
                            </div>
                            <div class="text-warning small">${stars}</div>
                            <p class="mb-0 small mt-1">${r.Comment || ''}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<p class="text-center text-muted mb-0">No reviews yet. Be the first to review!</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="text-center text-danger mb-0">Error loading reviews.</p>';
    }
}

async function submitReview() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return alert("Please login first.");
    
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    const stockID = _modalItemId;
    
    if (!stockID) return;
    
    try {
        const response = await fetch('../WanWorkSpace/stock/add_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stockID, customerID: currentUser.id, rating, comment })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('reviewComment').value = '';
            loadProductReviews(stockID);
        } else {
            alert(data.message);
        }
    } catch (e) {
        alert("Failed to submit review.");
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
    if (path.includes('profile.html')) {
        loadUserProfile();
        loadUserOrders();
    }
    
    // Employee views
    if (path.includes('employee_home.html')) {
        loadAnalytics();
        loadLowStockAlerts();
    }
    if (path.includes('order_details.html'))  loadEmployeeOrders();
    if (path.includes('stock_details.html'))  loadEmployeeStock();
    if (path.includes('feedback_details.html')) loadFeedback();
    if (path.includes('membership_details.html')) loadCustomers();
});
