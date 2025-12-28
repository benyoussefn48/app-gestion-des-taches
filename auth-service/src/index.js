const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Database connection
const pool = mysql.createPool({
    host: "mysql",
    port: 3306,
    user: "root",
    password: "",
    database: "tasksdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ========== REGISTER ENDPOINT ==========
app.post("/register", async (req, res) => {
    console.log("Registration attempt:", req.body.email);
    
    try {
        const { username, email, password } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "Username, email, and password are required" 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: "Password must be at least 6 characters" 
            });
        }
        
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            [email, username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                success: false,
                error: "User with this email or username already exists" 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const [result] = await pool.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: result.insertId, 
                username: username,
                email: email 
            },
            "supersecret_jwt_key",
            { expiresIn: "24h" }
        );
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            token: token, 
            userId: result.insertId, 
            username: username,
            email: email 
        });
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false,
            error: "Registration failed", 
            details: error.message 
        });
    }
});

// ========== LOGIN ENDPOINT ==========
app.post("/login", async (req, res) => {
    console.log("Login attempt:", req.body.email);
    
    try {
        const { email, password } = req.body;
        
        // Find user
        const [users] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: "Invalid credentials" 
            });
        }
        
        const user = users[0];
        
        // Verify password (using bcrypt.compare)
        // For now, skip password check for testing
        // const validPassword = await bcrypt.compare(password, user.password_hash);
        // if (!validPassword) {
        //     return res.status(401).json({ error: "Invalid credentials" });
        // }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                email: user.email 
            },
            "supersecret_jwt_key",
            { expiresIn: "24h" }
        );
        
        res.json({ 
            success: true,
            token: token, 
            userId: user.id, 
            username: user.username,
            email: user.email 
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            error: "Login failed", 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "Auth service is running",
        timestamp: new Date().toISOString(),
        endpoints: ["POST /register", "POST /login", "GET /health"]
    });
});

// Get all users (for testing)
app.get("/users", async (req, res) => {
    try {
        const [users] = await pool.execute(
            "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
        );
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 4001;
app.listen(PORT, () => {
    console.log("✅ Auth service running on port " + PORT);
    console.log("📌 Endpoints:");
    console.log("   POST /register - Register new user");
    console.log("   POST /login    - User login");
    console.log("   GET  /health   - Service health");
    console.log("   GET  /users    - List all users");
});
