const express = require('express');
const router = express.Router();
const persist = require('./persist');  // Import the persist module

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Route to display the gift card purchase page
router.get('/giftcard', isAuthenticated, async (req, res) => {
    try {
        res.render('giftcard');
    } catch (error) {
        console.error('Error rendering gift card page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the gift card checkout process
router.post('/giftcard/checkout', isAuthenticated, async (req, res) => {
    try {
        const { amount, message, yourName, recipientEmail } = req.body;

        // Load existing gift cards data
        let giftcards = await persist.readData('giftcards.json');

        // Generate a unique ID for the gift card purchase (or use another identifier like email or date)
        const giftcardId = Date.now(); // Using timestamp as a simple unique ID

        // Store the gift card data
        giftcards[giftcardId] = {
            amount,
            message,
            yourName,
            recipientEmail,
            date: new Date().toISOString()
        };

        // Save the updated gift cards data back to the file
        await persist.writeData('giftcards.json', giftcards);

        // Redirect to the thank you page
        res.redirect('/users/giftcard/thank-you');
    } catch (error) {
        console.error('Error during gift card checkout:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display the gift card thank you page
router.get('/giftcard/thank-you', isAuthenticated, async (req, res) => {
    try {
        res.render('giftcardThankYou');
    } catch (error) {
        console.error('Error rendering thank you page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display the gift card purchase confirmation page
router.get('/giftcard/confirmation', isAuthenticated, async (req, res) => {
    try {
        res.render('giftcardConfirmation');
    } catch (error) {
        console.error('Error rendering confirmation page:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;