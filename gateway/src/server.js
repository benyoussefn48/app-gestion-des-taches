const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Auth service proxy
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    onError: (err, req, res) => {
        console.error('Auth Service Proxy Error:', err.message);
        res.status(502).json({ error: 'Auth service unavailable' });
    }
}));

// Task service proxy
app.use('/api/tasks', createProxyMiddleware({
    target: process.env.TASK_SERVICE_URL || 'http://task-service:4002',
    changeOrigin: true,
    pathRewrite: { '^/api/tasks': '' },
    onError: (err, req, res) => {
        console.error('Task Service Proxy Error:', err.message);
        res.status(502).json({ error: 'Task service unavailable' });
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Gateway is running',
        timestamp: new Date().toISOString(),
        services: {
            auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
            task: process.env.TASK_SERVICE_URL || 'http://task-service:4002'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API Gateway for Task Management System',
        endpoints: {
            auth: '/api/auth/*',
            tasks: '/api/tasks/*',
            health: '/health'
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ API Gateway running on port ${PORT}`);
    console.log(`🔗 Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://auth-service:4001'}`);
    console.log(`🔗 Task Service: ${process.env.TASK_SERVICE_URL || 'http://task-service:4002'}`);
});