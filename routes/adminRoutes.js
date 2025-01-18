// Handles: Admin-specific functionalities

const express = require('express');
const router = express.Router();
const persist = require('./persist'); // Import the persist module

// Middleware to check if the user is authenticated and an admin
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

function isAdmin(req, res, next) {
    if (req.cookies.username === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied.');
    }
}

// Admin dashboard route
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const activityLog = await persist.readData('activityLog.json');
        const products = await persist.readData('products.json');
        res.render('admin', { activityLog, products });
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to add a new product
router.post('/admin/add-product', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, description, image, price } = req.body;
        const products = await persist.readData('products.json');

        // Add the new product to the products array
        products.push({ title, description, image, price: parseFloat(price) });

        // Save the updated products array back to the JSON file
        await persist.writeData('products.json', products);

        // Redirect back to the admin page
        res.redirect('/users/admin');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to delete a product
router.post('/admin/delete-product', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title } = req.body;
        let products = await persist.readData('products.json');

        // Filter out the product to be removed
        products = products.filter(product => product.title !== title);

        // Save the updated products array back to the JSON file
        await persist.writeData('products.json', products);

        // Redirect back to the admin page
        res.redirect('/users/admin');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to clear logs
router.post('/admin/clear-logs', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Clear the activity log by writing an empty array to the file
        await persist.writeData('activityLog.json', []);

        // Respond with success
        res.sendStatus(200);
    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
