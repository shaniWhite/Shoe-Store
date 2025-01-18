const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const baseUrl = 'http://localhost:3000';

function checkStatus(response, expectedStatus, testName) {
    if (response.status === expectedStatus) {
        console.log(`✓ ${testName}`);
    } else {
        console.log(`✗ ${testName} - Expected ${expectedStatus}, got ${response.status}`);
    }
}

async function runGETTests() {
    try {
        let response = await fetch(`${baseUrl}/`);
        checkStatus(response, 200, 'GET /');
    } catch (error) {
        console.error('Error in GET /:', error);
    }

    // Test with /users prefix
    try {
        let response = await fetch(`${baseUrl}/users/cart`, {
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /users/cart (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /users/cart:', error);
    }

    try {
        let response = await fetch(`${baseUrl}/users/admin`, {
            redirect: 'manual'
        });
        checkStatus(response, 302, 'GET /users/admin (unauthenticated)');
    } catch (error) {
        console.error('Error in GET /users/admin:', error);
    }
}

async function runPOSTTests() {
    let response = await fetch(`${baseUrl}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'testuser',
            password: 'testpassword'
        }),
    });

    if (response.status === 200) {
        console.log('✓ POST /users/register passed');
    } else {
        console.log(`✗ POST /users/register - Expected 201, got ${response.status}`);
    }

    response = await fetch(`${baseUrl}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'testuser',
            password: 'testpassword'
        }),
    });

    if (response.status === 200) {
        console.log('✓ POST /users/login passed');
    } else {
        console.log(`✗ POST /users/login - Expected 200, got ${response.status}`);
    }

    response = await fetch(`${baseUrl}/users/store/add-to-cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'username=testuser'  // Simulate authenticated user
        },
        body: JSON.stringify({
            title: 'White Dunks',
            size: '37'
        }),
    });
    
    if (response.status === 200) {
        console.log('✓ POST /users/store/add-to-cart passed');
    } else {
        console.log(`✗ POST /users/store/add-to-cart - Expected 200, got ${response.status}`);
    }

    response = await fetch(`${baseUrl}/users/store/add-to-cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'White Dunks',
            size: '37'
        }),
    });
    
    if (response.url.includes('/users/login')) {
        console.log('✓ POST /users/store/add-to-cart (unauthenticated) redirected to login');
    } else {
        console.log(`✗ POST /users/store/add-to-cart (unauthenticated) - Expected redirect to login, got ${response.status}`);
    }
     
    response = await fetch(`${baseUrl}/users/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cartId: '67890'
        }),
    });

    if (response.status === 200) {
        console.log('✓ POST /users/checkout passed');
    } else {
        console.log(`✗ POST /users/checkout - Expected 200, got ${response.status}`);
    }
}

async function runDELETETests() {
    response = await fetch(`${baseUrl}/users/store/remove-from-cart`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'username=testuser' // Set the username cookie
        },
        body: JSON.stringify({
            title: 'White Dunks'
        }),
    });
    
    if (response.status === 200) {
        console.log('✓ DELETE /users/store/remove-from-cart passed');
    } else {
        console.log(`✗ DELETE /users/store/remove-from-cart - Expected 200, got ${response.status}`);
    }
    
}

async function runTests() {
    await runGETTests();
    console.log('All GET tests executed.');

    await runPOSTTests();
    console.log('All POST tests executed.');

    await runDELETETests();
    console.log('All DELETE tests executed.');
}

runTests().catch(error => {
    console.error('Error during test execution:', error);
});
