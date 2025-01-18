const express = require('express');
const router = express.Router();
const persist = require('./persist'); // Import the persist module
const moment = require('moment-timezone');
// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Route to display products in the store
router.get('/store', async (req, res) => {
    try {
        const products = await persist.readData('products.json');
        res.render('store', { products, username: req.cookies.username });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add to cart route
router.post('/store/add-to-cart', isAuthenticated, async (req, res) => {
    try {
        const { title, size } = req.body;
        const username = req.cookies.username;

        console.log('Received request to add to cart:', title);

        const products = await persist.readData('products.json');
        const product = products.find(p => p.title.toLowerCase() === title.toLowerCase());

        if (!product) {
            console.log('Product not found:', title);
            return res.status(400).json({ success: false, message: 'Product not found.' });
        }

        const cart = await persist.readData('cart.json');

        if (!cart[username]) {
            cart[username] = [];
        }

        const existingProductIndex = cart[username].findIndex(item => item.title === title && item.size === size);

        if (existingProductIndex !== -1) {
            cart[username][existingProductIndex].quantity += 1;
        } else {
            cart[username].push({ ...product, quantity: 1, size: size });
        }

        await persist.writeData('cart.json', cart);

        console.log('Cart updated:', cart[username]);

        // Log the "Add to Cart" action in the activity log
        const activityLog = await persist.readData('activityLog.json');
        const newActivity = {
            datetime: moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss'),
            username,
            type: `Added to cart: ${title} (Size: ${size})`
        };
        activityLog.push(newActivity);
        await persist.writeData('activityLog.json', activityLog);

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

// View wishlist route
router.get('/wishlist', isAuthenticated, async (req, res) => {
    try {
        const username = req.cookies.username;
        const wishlist = await persist.readData('wishlist.json');
        const userWishlist = wishlist[username] || [];

        // Load products to map title to image and price
        const products = await persist.readData('products.json');
        const productMap = new Map(products.map(p => [p.title, p]));

        // Map wishlist items to include images and prices
        const wishlistWithDetails = userWishlist.map(item => ({
            ...item,
            image: productMap.get(item.title)?.image || null,
            price: productMap.get(item.title)?.price || 'N/A'  // Include price, default to 'N/A' if not found
        }));

        res.render('wishlist', { wishlist: wishlistWithDetails });
    } catch (error) {
        console.error('Error loading wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add to wishlist route
router.post('/wishlist/add', isAuthenticated, async (req, res) => {
    try {
        const { title, size } = req.body;
        const username = req.cookies.username;
        const wishlist = await persist.readData('wishlist.json');

        if (!wishlist[username]) {
            wishlist[username] = [];
        }

        // Check if the product with the same title and size is already in the wishlist
        const existingItem = wishlist[username].some(item => item.title === title && item.size === size);

        if (!existingItem) {
            wishlist[username].push({ title, size });
            await persist.writeData('wishlist.json', wishlist);
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Item already in wishlist' });
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Remove from wishlist route
router.delete('/wishlist/remove', isAuthenticated, async (req, res) => {
    try {
        const { title, size } = req.body;
        const username = req.cookies.username;

        const wishlist = await persist.readData('wishlist.json');

        if (!wishlist[username]) {
            return res.status(400).json({ success: false });
        }

        wishlist[username] = wishlist[username].filter(item => item.title !== title || item.size !== size);

        await persist.writeData('wishlist.json', wishlist);

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
