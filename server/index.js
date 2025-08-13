const express=require('express');
const http=require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB=require('./config/db');
const socketHandler=require('./socket/socketHandler');
const { setIO } = require('./socketInstance');

const app=express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Use routes
app.use('/api', require('./routes/index'));

// Socket.io setup
const {Server}=require('socket.io');
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

// Initialize socket instance for use in controllers
setIO(io);

// Socket handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



