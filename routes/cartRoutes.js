const express = require('express');
const router = express.Router();
const persist = require('./persist'); // Import the persist module

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Route to view the cart
router.get('/cart',  isAuthenticated, async (req, res) => {
    const username = req.cookies.username;
    const cart = await persist.readData('cart.json');
    res.render('cart', { cart: cart[username] || [] });
});

// Route to handle checkout
router.post('/checkout', isAuthenticated, async (req, res) => {
    const username = req.cookies.username;
    const cart = await persist.readData('cart.json');

    if (!cart[username] || cart[username].length === 0) {
        return res.redirect('/users/cart'); // Redirect back to the cart page
    }

    let totalPrice = 0;

    if (cart[username]) {
        cart[username].forEach(item => {
            totalPrice += item.price * item.quantity;
        });
    }

    // Render the checkout page with cart details and total price
    res.render('checkout', { cart: cart[username], totalPrice: totalPrice });
});

// Route to handle 'complete purchase'
router.post('/checkout/complete', isAuthenticated, async (req, res) => {
    const username = req.cookies.username;
    const cart = await persist.readData('cart.json');
    const purchases = await persist.readData('purchases.json');

    if (!cart[username] || cart[username].length === 0) {
        return res.status(400).send('Your cart is empty.');
    }

    // Add the cart items to the user's purchase history
    if (!purchases[username]) {
        purchases[username] = [];
    }
    purchases[username].push(...cart[username]);

    // Clear the user's cart
    cart[username] = [];

    // Save the updated cart and purchases back to the file
    await persist.writeData('cart.json', cart);
    await persist.writeData('purchases.json', purchases);

    // Redirect to the thank you page
    res.redirect('/users/thankyou');
});

// Route to display the thank you page
router.get('/thankyou', isAuthenticated, (req, res) => {
    res.render('thankyou');
});

// Increase quantity route
router.put('/store/increase-quantity', isAuthenticated, async (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = await persist.readData('cart.json');

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    const productIndex = cart[username].findIndex(item => item.title === title);

    if (productIndex !== -1) {
        cart[username][productIndex].quantity += 1;
    } else {
        return res.status(400).json({ success: false, message: 'Product not found in cart.' });
    }

    await persist.writeData('cart.json', cart);

    res.json({ success: true });
});

// Decrease quantity route
router.put('/store/decrease-quantity', isAuthenticated, async (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = await persist.readData('cart.json');

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    const productIndex = cart[username].findIndex(item => item.title === title);

    if (productIndex !== -1) {
        if (cart[username][productIndex].quantity > 1) {
            cart[username][productIndex].quantity -= 1;
        } else {
            cart[username].splice(productIndex, 1); // Remove item if quantity is 0
        }
    } else {
        return res.status(400).json({ success: false, message: 'Product not found in cart.' });
    }

    await persist.writeData('cart.json', cart);

    res.json({ success: true });
});

// Remove from cart route
router.delete('/store/remove-from-cart', async (req, res) => {
    console.log('DELETE /store/remove-from-cart route hit'); // Debugging line
    const { title } = req.body;
    const username = req.cookies.username;

    console.log('Received request to remove from cart:', title);

    const cart = await persist.readData('cart.json');

    if (!cart[username]) {
        console.log('Cart not found for user:', username);
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    const initialCartSize = cart[username].length;

    cart[username] = cart[username].filter(item => item.title.toLowerCase() !== title.toLowerCase());

    if (cart[username].length === initialCartSize) {
        console.log('Item not found in cart:', title);
        return res.status(400).json({ success: false, message: 'Item not found in cart.' });
    }

    await persist.writeData('cart.json', cart);

    console.log('Cart after removal:', cart[username]);

    res.json({ success: true });
});

module.exports = router;
