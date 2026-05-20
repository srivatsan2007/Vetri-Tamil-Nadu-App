const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
// Serve static files from current directory
app.use(express.static(__dirname));

// Explicitly serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize users.json if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
}

// Register API
app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const usersData = fs.readFileSync(usersFilePath);
        const users = JSON.parse(usersData);

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const newUser = { name, email, phone, password };
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const usersData = fs.readFileSync(usersFilePath);
        const users = JSON.parse(usersData);

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Do not send password back
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
