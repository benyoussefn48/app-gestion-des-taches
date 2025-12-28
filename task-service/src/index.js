const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

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

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    
    jwt.verify(token, "supersecret_jwt_key", (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// ========== GET ALL TASKS ==========
app.get("/", authenticateToken, async (req, res) => {
    console.log("Getting tasks for user:", req.user.userId);
    
    try {
        const [tasks] = await pool.execute(
            "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.userId]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// ========== GET SINGLE TASK ==========
app.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [tasks] = await pool.execute(
            "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
            [id, req.user.userId]
        );
        
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        res.json(tasks[0]);
    } catch (error) {
        console.error("Get single task error:", error);
        res.status(500).json({ error: "Failed to fetch task" });
    }
});

// ========== CREATE TASK ==========
app.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, description, status = "pending" } = req.body;
        
        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "Title is required" });
        }
        
        const [result] = await pool.execute(
            "INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)",
            [title.trim(), description || "", status, req.user.userId]
        );
        
        const [task] = await pool.execute(
            "SELECT * FROM tasks WHERE id = ?",
            [result.insertId]
        );
        
        res.status(201).json(task[0]);
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// ========== UPDATE ENTIRE TASK ==========
app.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        
        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "Title is required" });
        }
        
        if (!["pending", "done"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'pending' or 'done'" });
        }
        
        const [result] = await pool.execute(
            "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?",
            [title.trim(), description || "", status, id, req.user.userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or access denied" });
        }
        
        const [task] = await pool.execute(
            "SELECT * FROM tasks WHERE id = ?",
            [id]
        );
        
        res.json(task[0]);
    } catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// ========== UPDATE TASK STATUS ONLY ==========
app.put("/:id/status", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!["pending", "done"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'pending' or 'done'" });
        }
        
        const [result] = await pool.execute(
            "UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?",
            [status, id, req.user.userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or access denied" });
        }
        
        const [task] = await pool.execute(
            "SELECT * FROM tasks WHERE id = ?",
            [id]
        );
        
        res.json(task[0]);
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ error: "Failed to update task status" });
    }
});

// ========== DELETE TASK ==========
app.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            [id, req.user.userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or access denied" });
        }
        
        res.json({ 
            success: true,
            message: "Task deleted successfully",
            deletedId: id
        });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// ========== HEALTH CHECK ==========
app.get("/health", (req, res) => {
    res.json({ 
        status: "Task service is running",
        timestamp: new Date().toISOString(),
        endpoints: {
            "GET /": "Get all tasks",
            "GET /:id": "Get single task",
            "POST /": "Create task",
            "PUT /:id": "Update entire task",
            "PUT /:id/status": "Update task status",
            "DELETE /:id": "Delete task"
        }
    });
});

// ========== TEST DATABASE ==========
app.get("/test-db", async (req, res) => {
    try {
        const [tasks] = await pool.execute("SELECT COUNT(*) as count FROM tasks");
        res.json({ message: "Database connected", taskCount: tasks[0].count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 4002;
app.listen(PORT, () => {
    console.log("✅ Task service running on port " + PORT);
    console.log("📊 Database: mysql:3306/tasksdb");
    console.log("🔗 CORS enabled for: http://localhost:3000");
});
