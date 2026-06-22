// ==================== API CONFIGURATION ====================
const API_URL = 'http://localhost/bsaoutlet/';

console.log('🔗 API URL:', API_URL);

let pageHistory = ['home'];
let currentUserType = 'customer';
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

function updateBackButton() {
    const container = document.getElementById('backButtonContainer');
    if (!container) return;
    if (pageHistory.length > 1) {
        container.innerHTML = '<div class="back-btn" onclick="goBack()">← Back</div>';
    } else {
        container.innerHTML = '';
    }
}

function goBack() {
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const previousPage = pageHistory[pageHistory.length - 1];
        showPage(previousPage, true);
    }
}

function goHome() { showPage('home'); }

function updateNavbar() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    if (currentUser && currentUser.type === 'staff') {
        nav.innerHTML = `<a onclick="showPage('staff_dashboard')">Dashboard</a><a onclick="showPage('staff_products')">Products</a><a onclick="showPage('staff_orders')">Orders</a><a onclick="showPage('staff_customers')">Customers</a><a onclick="showPage('staff_reports')">Reports</a><a onclick="showPage('cart')" class="cart-link">🛒 Cart <span id="cartCount">0</span></a><a onclick="staffLogout()" class="logout-btn">Logout</a>`;
    } else if (currentUser && currentUser.type === 'customer') {
        nav.innerHTML = `<a onclick="showPage('home')">Home</a><a onclick="showPage('menswear')">Menswear</a><a onclick="showPage('womenswear')">Womenswear</a><a onclick="showPage('kids')">Kids</a><a onclick="showPage('shoe')">Shoe</a><a onclick="showPage('about')">About</a><a onclick="showPage('cart')" class="cart-link">🛒 Cart <span id="cartCount">0</span></a><a onclick="logout()" class="logout-btn">${currentUser.name.split(' ')[0]} | Logout</a>`;
    } else {
        nav.innerHTML = `<a onclick="showPage('home')">Home</a><a onclick="showPage('menswear')">Menswear</a><a onclick="showPage('womenswear')">Womenswear</a><a onclick="showPage('kids')">Kids</a><a onclick="showPage('shoe')">Shoe</a><a onclick="showPage('about')">About</a><a onclick="showPage('cart')" class="cart-link">🛒 Cart <span id="cartCount">0</span></a><a onclick="showPage('signin')">Sign In</a>`;
    }
    updateCartCount();
}

function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(c) { localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }

function addToCart(name, price) {
    let cart = getCart();
    let existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name: name, price: price, qty: 1 });
    saveCart(cart);
    showNotification(`✅ ${name} added to cart!`, 'success');
}

function updateCartCount() {
    let cart = getCart();
    let count = cart.reduce((s, i) => s + i.qty, 0);
    let spans = document.querySelectorAll('#cartCount');
    spans.forEach(span => { if (span) span.innerHTML = count; });
}

function loadCartPage() {
    let cart = getCart();
    let itemsDiv = document.getElementById('cartItems');
    let summaryDiv = document.getElementById('cartSummary');
    if (cart.length === 0) {
        itemsDiv.innerHTML = '<div class="empty-cart"><div style="font-size:4rem;">🛒</div><h3>Your cart is empty</h3><button class="btn" onclick="showPage(\'menswear\')">Shop Now</button></div>';
        summaryDiv.innerHTML = '';
        return;
    }
    let html = '', subtotal = 0;
    cart.forEach((item, idx) => {
        let total = item.price * item.qty;
        subtotal += total;
        html += `<div class="cart-item"><div><h4>${item.name}</h4><p>RM ${item.price}</p></div><div><button class="qty-btn" onclick="updateQty(${idx}, -1)">-</button> ${item.qty} <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button> <button class="qty-btn" onclick="removeItem(${idx})">🗑️</button></div><div style="color:#F5B042;">RM ${total}</div></div>`;
    });
    let tax = subtotal * 0.1;
    let total = subtotal + tax;
    itemsDiv.innerHTML = html;
    summaryDiv.innerHTML = `<h3>Order Summary</h3><div class="summary-row"><span>Subtotal</span><span>RM ${subtotal.toFixed(2)}</span></div><div class="summary-row"><span>Tax (10%)</span><span>RM ${tax.toFixed(2)}</span></div><div class="summary-row total"><span>Grand Total</span><span>RM ${total.toFixed(2)}</span></div><button class="btn" onclick="checkout()">Proceed to Payment →</button><button class="btn-outline" onclick="clearCart()" style="margin-top:10px;">Clear Cart</button>`;
}

function updateQty(idx, change) {
    let cart = getCart();
    let newQty = cart[idx].qty + change;
    if (newQty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = newQty;
    saveCart(cart);
    loadCartPage();
}

function removeItem(idx) { let cart = getCart(); cart.splice(idx, 1); saveCart(cart); loadCartPage(); }
function clearCart() { if (confirm('Clear cart?')) { localStorage.removeItem('cart'); loadCartPage(); updateCartCount(); } }

function checkout() { 
    let cart = getCart(); 
    if (cart.length) { 
        localStorage.setItem('checkoutCart', JSON.stringify(cart)); 
        showPage('receipt'); 
        loadReceipt(); 
        if (currentUser) {
            let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            let tax = total * 0.1;
            let grandTotal = total + tax;
            fetch(API_URL + 'add_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: currentUser.id,
                    customerName: currentUser.name,
                    orderAmount: grandTotal,
                    employeeId: 'E001',
                    stockId: 'S001'
                })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    document.getElementById('orderId').innerHTML = `Order ID: ${data.orderId}`;
                }
            }).catch(err => console.error('Order error:', err));
        }
    } 
}

function loadReceipt() { 
    let cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]'); 
    let html = '', subtotal = 0; 
    cart.forEach(item => { 
        let total = item.price * item.qty; 
        subtotal += total; 
        html += `<div class="summary-row"><span>${item.name} x${item.qty}</span><span>RM ${total.toFixed(2)}</span></div>`; 
    }); 
    let tax = subtotal * 0.1, total = subtotal + tax; 
    document.getElementById('receiptItems').innerHTML = html + `<div class="summary-row"><span>Subtotal</span><span>RM ${subtotal.toFixed(2)}</span></div><div class="summary-row"><span>Tax</span><span>RM ${tax.toFixed(2)}</span></div>`; 
    document.getElementById('receiptTotal').innerHTML = `<div class="summary-row total"><span>Total</span><span>RM ${total.toFixed(2)}</span></div><p style="color:#4CAF50;">✓ Payment Successful</p>`; 
    localStorage.removeItem('cart'); 
    localStorage.removeItem('checkoutCart'); 
    updateCartCount(); 
}

async function loadProductsFromDB() {
    console.log('🔄 Loading products from:', API_URL + 'get_stock.php');
    
    const grids = ['menswearProducts', 'womenswearProducts', 'kidsProducts', 'shoeProducts'];
    grids.forEach(grid => {
        const container = document.getElementById(grid);
        if (container) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">Loading products...</p>';
        }
    });
    
    try {
        const response = await fetch(API_URL + 'get_stock.php');
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success && data.stock && data.stock.length > 0) {
            const menswear = data.stock.filter(p => p.StockCategory === 'Menswear');
            const womenswear = data.stock.filter(p => p.StockCategory === 'Womenswear');
            const kids = data.stock.filter(p => p.StockCategory === 'Kids');
            const shoe = data.stock.filter(p => p.StockCategory === 'Shoe');
            
            displayProductGrid('menswearProducts', menswear);
            displayProductGrid('womenswearProducts', womenswear);
            displayProductGrid('kidsProducts', kids);
            displayProductGrid('shoeProducts', shoe);
            
            document.getElementById('homeProductCount').innerHTML = data.stock.length;
            showNotification(`✅ ${data.stock.length} products loaded!`, 'success');
        } else {
            console.error('No products found:', data);
            grids.forEach(grid => {
                const container = document.getElementById(grid);
                if (container) {
                    container.innerHTML = '<p style="text-align:center; padding:40px;">No products available. Staff can add products in dashboard.</p>';
                }
            });
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showNotification('Error loading products. Make sure XAMPP is running!', 'error');
        grids.forEach(grid => {
            const container = document.getElementById(grid);
            if (container) {
                container.innerHTML = '<p style="text-align:center; padding:40px; color:#ff4444;">❌ Error loading products. Make sure XAMPP is running at localhost!</p>';
            }
        });
    }
}

function displayProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">No products available in this category yet.</p>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-image">${getProductEmoji(p.StockCategory)}</div>
            <div class="product-info">
                <h3 class="product-title">${escapeHtml(p.StockName)}</h3>
                <div class="product-price">RM ${parseFloat(p.StockPrice).toFixed(2)}</div>
                <button class="btn" onclick="addToCart('${escapeHtml(p.StockName)}', ${parseFloat(p.StockPrice)})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function getProductEmoji(category) {
    switch(category) {
        case 'Menswear': return '👔';
        case 'Womenswear': return '👗';
        case 'Kids': return '🧸';
        case 'Shoe': return '👟';
        default: return '👕';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function loadStaffProducts() {
    try {
        const response = await fetch(API_URL + 'get_stock.php');
        const data = await response.json();
        if (data.success && data.stock && data.stock.length > 0) {
            let html = `<div class="table-container"><table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Qty</th><th>Action</th></tr></thead><tbody>`;
            data.stock.forEach(item => {
                html += `<tr>
                    <td>${item.StockID}</td>
                    <td>${escapeHtml(item.StockName)}</td>
                    <td>${item.StockCategory}</td>
                    <td>RM ${parseFloat(item.StockPrice).toFixed(2)}</td>
                    <td>${item.StockQuantity}</td>
                    <td><button class="delete-btn" onclick="deleteStock('${item.StockID}')">Delete</button></td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            document.getElementById('staffProductsList').innerHTML = html;
            document.getElementById('staffTotalProducts').innerHTML = data.stock.length;
        } else {
            document.getElementById('staffProductsList').innerHTML = '<p>No products found. Add some!</p>';
            document.getElementById('staffTotalProducts').innerHTML = '0';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('staffProductsList').innerHTML = '<p>Error loading products. Make sure XAMPP is running!</p>';
    }
}

async function addProductToDB(e) {
    e.preventDefault();
    const name = document.getElementById('staffProductName').value;
    const price = document.getElementById('staffProductPrice').value;
    const category = document.getElementById('staffProductCategory').value;
    const quantity = document.getElementById('staffProductQty').value;
    if (!name || !price || !quantity) {
        showNotification('Please fill all fields!', 'error');
        return;
    }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Adding...';
    try {
        const response = await fetch(API_URL + 'add_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, price: price, category: category, quantity: quantity })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Product added successfully!', 'success');
            document.getElementById('staffProductName').value = '';
            document.getElementById('staffProductPrice').value = '';
            document.getElementById('staffProductQty').value = '';
            loadStaffProducts();
            loadProductsFromDB();
            loadStaffDashboard();
        } else {
            showNotification('❌ Failed to add product: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Connection error! Make sure XAMPP is running.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '➕ Add Product';
    }
}

async function deleteStock(stockId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(API_URL + 'delete_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stockId: stockId })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Product deleted successfully!', 'success');
            loadStaffProducts();
            loadProductsFromDB();
            loadStaffDashboard();
        } else {
            showNotification('❌ Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Connection error!', 'error');
    }
}

async function loadStaffDashboard() {
    try {
        const productRes = await fetch(API_URL + 'get_stock.php');
        const productData = await productRes.json();
        document.getElementById('staffTotalProducts').innerHTML = productData.stock ? productData.stock.length : 0;
        
        const customerRes = await fetch(API_URL + 'get_customer.php');
        const customerData = await customerRes.json();
        document.getElementById('staffTotalCustomers').innerHTML = customerData.customers ? customerData.customers.length : 0;
        
        const orderRes = await fetch(API_URL + 'get_orders.php');
        const orderData = await orderRes.json();
        const ordersList = orderData.orders || [];
        document.getElementById('staffTotalOrders').innerHTML = ordersList.length;
        
        const feedbackRes = await fetch(API_URL + 'get_feedback.php');
        const feedbackData = await feedbackRes.json();
        document.getElementById('staffTotalFeedback').innerHTML = feedbackData.feedback ? feedbackData.feedback.length : 0;
        
        let recentHtml = `<table><thead><tr><th>Order ID</th><th>Customer</th><th>Employee</th><th>Amount</th><th>Status</th></tr></thead><tbody>`;
        ordersList.slice(0, 5).forEach(order => {
            const status = order.OrderStatus || 'Pending';
            const statusClass = status === 'Paid' ? 'status-paid' : 
                               status === 'Processing' ? 'status-processing' :
                               status === 'Shipped' ? 'status-shipped' :
                               status === 'Delivered' ? 'status-delivered' : 'status-pending';
            recentHtml += `<tr>
                <td>${order.OrderID || 'N/A'}</td>
                <td>${order.CustomerName || order.CustomerID || 'N/A'}</td>
                <td>${order.EmployeeName || order.EmployeeID || 'N/A'}</td>
                <td>RM ${order.OrderAmount || 0}</td>
                <td><span class="${statusClass}">${status}</span></td>
            </tr>`;
        });
        recentHtml += `</tbody></table>`;
        document.getElementById('staffRecentOrders').innerHTML = recentHtml || '<p>No orders</p>';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadStaffOrders() {
    try {
        const response = await fetch(API_URL + 'get_orders.php');
        const data = await response.json();
        console.log('Orders data:', data);
        
        const ordersList = data.orders || [];
        let html = `<table><thead><tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Employee</th>
            <th>Stock ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
        </tr></thead><tbody>`;
        
        if (ordersList.length === 0) {
            html += `<tr><td colspan="8" style="text-align:center;padding:20px;">No orders found</td></tr>`;
        } else {
            ordersList.forEach(order => {
                const status = order.OrderStatus || 'Pending';
                html += `<tr>
                    <td>${order.OrderID || 'N/A'}</td>
                    <td>${order.OrderDate || 'N/A'}</td>
                    <td>${order.CustomerName || order.CustomerID || 'N/A'}</td>
                    <td>${order.EmployeeName || order.EmployeeID || 'N/A'}</td>
                    <td>${order.StockID || 'N/A'}</td>
                    <td>RM ${order.OrderAmount || 0}</td>
                    <td>
                        <select id="status_${order.OrderID}" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.1);padding:5px 8px;border-radius:8px;">
                            <option ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option ${status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option ${status === 'Paid' ? 'selected' : ''}>Paid</option>
                            <option ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                    <td><button class="btn-outline" style="padding:5px 10px;font-size:0.8rem;" onclick="updateOrderStatus('${order.OrderID}', document.getElementById('status_${order.OrderID}').value)">Update</button></td>
                </tr>`;
            });
        }
        html += `</tbody></table>`;
        document.getElementById('staffOrdersTable').innerHTML = html;
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('staffOrdersTable').innerHTML = '<p style="color:#ff4444;">Error loading orders. Make sure XAMPP is running!</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(API_URL + 'update_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId, status: status })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('✅ Order status updated!', 'success');
            loadStaffOrders();
            loadStaffDashboard();
        } else {
            showNotification('❌ Update failed: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Error updating order', 'error');
    }
}

async function loadStaffCustomers() {
    try {
        const response = await fetch(API_URL + 'get_customer.php');
        const data = await response.json();
        const customers = data.customers || [];
        let html = `<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Member</th></tr></thead><tbody>`;
        customers.forEach(c => {
            html += `<tr>
                <td>${c.CustomerID || 'N/A'}</td>
                <td>${c.CustomerName || 'N/A'}</td>
                <td>${c.CustomerEmail || '-'}</td>
                <td>${c.CustomerPhone || '-'}</td>
                <td>${c.CustomerAddress || '-'}</td>
                <td>${c.IsMember ? 'Yes' : 'No'}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById('staffCustomersTable').innerHTML = html || '<p>No customers</p>';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('staffCustomersTable').innerHTML = '<p>Error loading customers</p>';
    }
}

async function loadStaffFeedback() {
    try {
        const response = await fetch(API_URL + 'get_feedback.php');
        const data = await response.json();
        const feedbackList = data.feedback || [];
        let html = `<table><thead><tr><th>ID</th><th>Date</th><th>Order ID</th><th>Customer</th></tr></thead><tbody>`;
        feedbackList.forEach(f => {
            html += `<tr>
                <td>${f.FeedbackID || 'N/A'}</td>
                <td>${f.FeedbackDate || 'N/A'}</td>
                <td>${f.OrderID || 'N/A'}</td>
                <td>${f.CustomerName || f.CustomerID || 'N/A'}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById('staffFeedbackTable').innerHTML = html || '<p>No feedback</p>';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('staffFeedbackTable').innerHTML = '<p>Error loading feedback</p>';
    }
}

async function loadStaffReports() {
    try {
        const response = await fetch(API_URL + 'get_orders.php');
        const data = await response.json();
        const ordersList = data.orders || [];
        let totalRevenue = ordersList.reduce((sum, o) => sum + (parseFloat(o.OrderAmount) || 0), 0);
        let paidOrders = ordersList.filter(o => o.OrderStatus === 'Paid').length;
        let pendingOrders = ordersList.filter(o => o.OrderStatus === 'Pending' || o.OrderStatus === 'Processing').length;
        
        document.getElementById('reportStats').innerHTML = `
            <div class="stat-card"><div class="stat-number">RM ${totalRevenue.toFixed(2)}</div><div class="stat-label">Revenue</div></div>
            <div class="stat-card"><div class="stat-number">${paidOrders}</div><div class="stat-label">Paid</div></div>
            <div class="stat-card"><div class="stat-number">${pendingOrders}</div><div class="stat-label">Pending</div></div>
            <div class="stat-card"><div class="stat-number">${ordersList.length}</div><div class="stat-label">Total Orders</div></div>
        `;
        
        let html = `<table><thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Employee</th><th>Amount</th><th>Status</th></tr></thead><tbody>`;
        ordersList.forEach(order => {
            const status = order.OrderStatus || 'Pending';
            const statusClass = status === 'Paid' ? 'status-paid' : 
                               status === 'Processing' ? 'status-processing' :
                               status === 'Shipped' ? 'status-shipped' :
                               status === 'Delivered' ? 'status-delivered' : 'status-pending';
            html += `<tr>
                <td>${order.OrderID || 'N/A'}</td>
                <td>${order.OrderDate || 'N/A'}</td>
                <td>${order.CustomerName || order.CustomerID || 'N/A'}</td>
                <td>${order.EmployeeName || order.EmployeeID || 'N/A'}</td>
                <td>RM ${order.OrderAmount || 0}</td>
                <td><span class="${statusClass}">${status}</span></td>
            </tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById('reportOrders').innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleStaffFields() {
    const isStaff = document.querySelector('input[name="userType"]:checked').value === 'staff';
    document.getElementById('staffFields').classList.toggle('show', isStaff);
}

function setUserType(type) {
    currentUserType = type;
    document.getElementById('customerToggle').classList.toggle('active', type === 'customer');
    document.getElementById('staffToggle').classList.toggle('active', type === 'staff');
    document.getElementById('emailLabel').innerHTML = type === 'customer' ? 'Email' : 'Staff Email';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        showNotification('Please enter email and password!', 'error');
        return;
    }
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Signing...';
    try {
        const response = await fetch(API_URL + 'login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType: currentUserType, email: email, password: password })
        });
        const result = await response.json();
        if (result.success) {
            currentUser = { id: result.user.id, name: result.user.name, email: result.user.email, type: result.userType };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateNavbar();
            showNotification(`✅ Welcome ${result.user.name}!`, 'success');
            if (currentUser.type === 'staff') {
                document.getElementById('staffName').innerHTML = result.user.name;
                showPage('staff_dashboard');
            } else {
                showPage('home');
            }
        } else {
            showNotification(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Connection error! Make sure XAMPP is running.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
    }
    document.getElementById('loginForm').reset();
}

async function handleRegister(e) {
    e.preventDefault();
    const type = document.querySelector('input[name="userType"]:checked').value;
    const name = document.getElementById('fullname').value;
    const email = document.getElementById('contact').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!name || !email || !password) {
        showNotification('Please fill all fields!', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    const data = { userType: type, name: name, email: email, password: password };
    if (type === 'staff') {
        data.address = document.getElementById('staffAddress').value || '';
        data.phone = document.getElementById('staffPhone').value || '';
    }
    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Registering...';
    try {
        const response = await fetch(API_URL + 'register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(`✅ ${result.message}`, 'success');
            showPage('signin');
        } else {
            showNotification(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Connection error!', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Register';
    }
    document.getElementById('registerForm').reset();
    toggleStaffFields();
}

async function handleMember(e) {
    e.preventDefault();
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    if (!name || !email) {
        showNotification('Please fill name and email!', 'error');
        return;
    }
    try {
        const userRes = await fetch(API_URL + 'get_user.php?email=' + encodeURIComponent(email) + '&userType=customer');
        const userData = await userRes.json();
        if (userData.success) {
            const memberRes = await fetch(API_URL + 'membership.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, name: name, level: 'Basic' })
            });
            const memberData = await memberRes.json();
            if (memberData.success) {
                showNotification('✅ You are now a member!', 'success');
                showPage('signin');
            } else {
                showNotification('❌ ' + memberData.message, 'error');
            }
        } else {
            showNotification('❌ No account found. Please register first!', 'error');
            showPage('register');
        }
    } catch (error) {
        showNotification('❌ Connection error!', 'error');
    }
    document.getElementById('memberForm').reset();
}

function logout() { localStorage.removeItem('currentUser'); currentUser = null; updateNavbar(); showNotification('✅ Logged out', 'success'); showPage('home'); }
function staffLogout() { localStorage.removeItem('currentUser'); currentUser = null; updateNavbar(); showNotification('✅ Logged out', 'success'); showPage('home'); }

function showPage(pageId, fromBack = false) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (!fromBack) { pageHistory.push(pageId); }
    updateBackButton();
    if (pageId === 'cart') loadCartPage();
    if (pageId === 'receipt') loadReceipt();
    if (pageId === 'staff_dashboard') loadStaffDashboard();
    if (pageId === 'staff_products') loadStaffProducts();
    if (pageId === 'staff_orders') loadStaffOrders();
    if (pageId === 'staff_customers') loadStaffCustomers();
    if (pageId === 'staff_feedback') loadStaffFeedback();
    if (pageId === 'staff_reports') loadStaffReports();
    window.scrollTo(0, 0);
}

// ==================== INIT ====================
loadProductsFromDB();
updateNavbar();
setUserType('customer');
toggleStaffFields();
updateBackButton();

// Check if user is logged in
if (currentUser && currentUser.type === 'staff') {
    document.getElementById('staffName').innerHTML = currentUser.name;
}

console.log('🚀 BSA Outlet Ready!');
console.log('💡 API URL: ' + API_URL);