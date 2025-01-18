const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const fs = require('fs');  // Add this line to require the fs module
const path = require('path'); // Add this line to require the path module if it's used

// Route to render the registration page
router.get('/register', async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error rendering register page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the login page
router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle user registration
router.post('/register', async (req, res) => {
    try {
        await userController.register(req, res);
    } catch (error) {
        console.error('Error handling user registration:', error);
        res.status(500).render('register', { error: 'Internal Server Error' });
    }
});

// Route to handle user login
router.post('/login', async (req, res) => {
    try {
        await userController.login(req, res);
    } catch (error) {
        console.error('Error handling user login:', error);
        res.status(500).render('login', { error: 'Internal Server Error' });
    }
});

// Route to handle user logout
router.get('/logout', async (req, res) => {
    try {
        await userController.logout(req, res);
    } catch (error) {
        console.error('Error handling user logout:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the admin page, protected by authentication and admin checks
router.get('/admin', userController.isAuthenticated, userController.isAdmin, async (req, res) => {
    try {
        // Read the activity log and products data
        const activityLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/activityLog.json')));
        const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));

        // Render the admin page with the retrieved data
        res.render('admin', { activityLog, products });
    } catch (error) {
        console.error('Error rendering admin page:', error);  // Log the error to the console
        res.status(500).send('Internal Server Error');  // Respond with a generic error message
    }
});

module.exports = router;
