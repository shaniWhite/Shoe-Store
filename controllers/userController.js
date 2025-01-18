const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to read user data
function readUsers() {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
}

// Helper function to write user data
function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Register a new user
exports.register = (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users[username]) {
        return res.status(400).render('register', { error: 'User already exists.' });
    }

    users[username] = { username, password };
    writeUsers(users);

    res.redirect('/users/login');
};

// Login a user
exports.login = (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (!users[username] || users[username].password !== password) {
        return res.status(400).render('login', { error: 'Invalid username or password.' });
    }

    console.log(`User ${username} logged in successfully.`);

    const activityLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/activityLog.json')));
    activityLog.push({
        datetime: moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss'),
        username: username,
        type: 'Login'
    });
    fs.writeFileSync(path.join(__dirname, '../data/activityLog.json'), JSON.stringify(activityLog, null, 2));

    res.cookie('username', username, {
        maxAge: req.body.rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
        httpOnly: true
    });

    res.redirect('/users/store');
};

// Logout a user
exports.logout = (req, res) => {
    const username = req.cookies.username;

    const activityLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/activityLog.json')));
    activityLog.push({
        datetime: moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss'),
        username: username,
        type: 'Logout'
    });
    fs.writeFileSync(path.join(__dirname, '../data/activityLog.json'), JSON.stringify(activityLog, null, 2));

    res.clearCookie('username');
    res.redirect('/users/login');
};

// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.cookies.username) {
        res.locals.username = req.cookies.username; // Pass the username to EJS
        return next();
    } else {
        res.redirect('/users/login');
    }
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
    const users = readUsers();
    const username = req.cookies.username;

    if (username && users[username] && users[username].isAdmin) {
        return next();
    } else {
        res.status(403).send('Access denied.'); // Send an access denied message if not an admin
    }
};
