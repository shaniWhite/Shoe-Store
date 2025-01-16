// Import the necessary modules
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

// Apply middlewares
app.use(morgan('combined')); // Logs requests in Apache combined format
app.use(compression()); // Enable compression for responses
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public')));

// **Rate Limiting Middleware for General Use**
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increase limit to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// **Specific Rate Limiter for Login**
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Increase limit to 15 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
});
app.use('/users/login', loginLimiter);

// Middleware to make username available in all templates
app.use((req, res, next) => {
  res.locals.username = req.cookies.username || undefined;
  next();
});

// Import the separated route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const giftcardRoutes = require('./routes/giftcardRoutes');
const miscRoutes = require('./routes/miscRoutes');

const { readData } = require('./routes/persist'); // Adjust the path if necessary

// Use the separated routes
app.use('/users', authRoutes);
app.use('/users', productRoutes);
app.use('/users', cartRoutes);
app.use('/users', adminRoutes);
app.use('/users', giftcardRoutes);
app.use('/users', miscRoutes);

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // You can use any templating engine, here we're using EJS

// Route for the store page
app.get('/', async (req, res) => {
    try {
        const products = await readData('products.json'); // Adjust the path if necessary
        res.render('store', { products }); // Pass the products to the view
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Add the /llm.html route
app.get('/llm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'llm.html'));
});

// Add the /Readme.html route
app.get('/readme.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'readme.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
