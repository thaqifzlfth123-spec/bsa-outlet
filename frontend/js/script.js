const API_URL = '../WanWorkSpace/api/';

// Helper to get selected user type
function getSelectedUserType() {
    const customerRadio = document.getElementById('customer');
    if (customerRadio && customerRadio.checked) return 'customer';
    return 'staff';
}

// ---------------- LOGIN FORM ----------------
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
                alert(data.message);
                localStorage.setItem('currentUser', JSON.stringify({
                    type: userType,
                    ...data.user
                }));
                if (userType === 'customer') {
                    window.location.href = 'home.html';
                } else {
                    alert('Staff login successful. (Redirecting)');
                }
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('A network error occurred while trying to log in.');
        }
    });
}

// ---------------- REGISTER FORM ----------------
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
            console.error('Error during registration:', error);
            alert('A network error occurred while trying to register.');
        }
    });
}

function getCode() {
    alert("Verification code sent!");
}

// ---------------- PRODUCTS ----------------
async function loadProducts(category) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    try {
        const response = await fetch(API_URL + '../stock/get_stock.php');
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
                container.innerHTML += `
                    <div class="col-lg-4 col-md-6">
                        <div class="product-card">
                            <div class="product-img">Product</div>
                            <h4>${p.StockName}</h4>
                            <p>Premium quality item.</p>
                            <h5>RM ${price}</h5>
                            <button class="btn btn-warning w-100 buy-btn" onclick="addToCart('${p.StockID}', '${p.StockName}', ${price})">Buy</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="col-12 text-center"><p>Error loading products.</p></div>';
    }
}

// ---------------- CART & CHECKOUT ----------------
function addToCart(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(name + ' added to cart!');
}

function loadCart() {
    const tableBody = document.getElementById('cartTableBody');
    const summary = document.getElementById('cartSummary');
    const infoBox = document.getElementById('customerInfoBox');
    
    if (!tableBody || !summary) return;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (infoBox) {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB');
        if (currentUser && currentUser.id) {
            infoBox.querySelector('p').innerHTML = `<strong>Customer ID:</strong> ${currentUser.id} (${currentUser.name})`;
        } else {
            infoBox.querySelector('p').innerHTML = `<strong>Customer ID:</strong> Guest (Please login)`;
        }
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Your cart is empty.</td></tr>';
        summary.innerHTML = `<h4>Cart Summary</h4><p><strong>Grand Total:</strong> RM 0.00</p>`;
        return;
    }

    let subtotal = 0;
    tableBody.innerHTML = '';
    
    cart.forEach(item => {
        let total = item.price * item.qty;
        subtotal += total;
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
            </tr>
        `;
    });

    let tax = subtotal * 0.10;
    let grandTotal = subtotal + tax;

    summary.innerHTML = `
        <h4>Cart Summary</h4>
        <p><strong>Subtotal:</strong> RM ${subtotal.toFixed(2)}</p>
        <p><strong>Tax 10%:</strong> RM ${tax.toFixed(2)}</p>
        <h5><strong>Grand Total:</strong> RM ${grandTotal.toFixed(2)}</h5>
    `;
    
    localStorage.setItem('cartTotal', grandTotal.toFixed(2));
}

function clearCart() {
    if(confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTotal');
        loadCart();
    }
}

async function checkout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'customer') {
        alert('Please login as a customer to checkout.');
        window.location.href = 'index.html';
        return;
    }

    let totalAmount = localStorage.getItem('cartTotal') || 0;
    
    try {
        const response = await fetch(API_URL + '../order/add_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderDate: new Date().toISOString().split('T')[0],
                orderAmount: totalAmount,
                customerId: currentUser.id,
                customerName: currentUser.name,
                stockId: cart[0].id 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Payment Successful! Order ID: ' + data.orderId);
            localStorage.removeItem('cart');
            localStorage.removeItem('cartTotal');
            window.location.href = 'home.html';
        } else {
            alert('Checkout failed: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('A network error occurred during checkout.');
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
                
                let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.IsMember = 1;
                    currentUser.MembershipLevel = data.level;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
                
                window.location.href = 'home.html';
            } else {
                alert('Membership registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred.');
        }
    });
}

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('menswear.html')) loadProducts('Menswear');
    if (path.includes('cart.html')) loadCart();
});