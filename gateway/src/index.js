const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// Enable CORS for frontend (port 3000)
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Handle preflight requests
app.options("*", cors());

// Auth service proxy
app.use("/api/auth", createProxyMiddleware({
    target: "http://auth-service:4001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    onProxyReq: (proxyReq, req, res) => {
        console.log("Proxying auth request to:", proxyReq.path);
    },
    onError: (err, req, res) => {
        console.error("Auth Service Proxy Error:", err.message);
        res.status(502).json({ error: "Auth service unavailable" });
    }
}));

// Task service proxy
app.use("/api/tasks", createProxyMiddleware({
    target: "http://task-service:4002",
    changeOrigin: true,
    pathRewrite: { "^/api/tasks": "" },
    onProxyReq: (proxyReq, req, res) => {
        console.log("Proxying task request to:", proxyReq.path);
    },
    onError: (err, req, res) => {
        console.error("Task Service Proxy Error:", err.message);
        res.status(502).json({ error: "Task service unavailable" });
    }
}));

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "Gateway is running",
        timestamp: new Date().toISOString(),
        cors: "Enabled for http://localhost:3000"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "API Gateway for Task Management System",
        cors: "Enabled for http://localhost:3000",
        endpoints: {
            auth: "/api/auth/*",
            tasks: "/api/tasks/*",
            health: "/health"
        }
    });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log("✅ API Gateway running on port " + PORT);
    console.log("🔗 CORS enabled for: http://localhost:3000");
    console.log("🔗 Auth Service: http://auth-service:4001");
    console.log("🔗 Task Service: http://task-service:4002");
});
