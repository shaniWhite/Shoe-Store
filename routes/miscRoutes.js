//Handles: Terms and conditions, contact page, etc.

const express = require('express');
const router = express.Router();

// Route for the Terms and Conditions page
router.get('/terms', (req, res) => {
    res.render('terms');
});

// Route for the Contact Us page
router.get('/contact', (req, res) => {
    res.render('contact');
});

// Handle contact form submission
router.post('/contact', (req, res) => {
    const { name, email, orderNumber, reason, message } = req.body;

    // Process the form data here (e.g., save to a database, send an email)
    console.log('Contact Us Form Submitted:', { name, email, orderNumber, reason, message });

    // Redirect to a thank you page or show a success message
    res.redirect('/users/contact-success');
});

// Route to display the contact success page
router.get('/contact-success', (req, res) => {
    res.render('contact_success');
});

module.exports = router;



