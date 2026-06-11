const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

dotenv.config();

const app = express();

connectDB();



app.use(helmet());

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'https://mis.techversity.ai'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// server.js mein add karo, routes se pehle
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                    // sirf 10 attempts
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', loginLimiter);


app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./src/routes/auth'));
app.use('/api/students', require('./src/routes/students'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/notes',    require('./src/routes/notes'));

// Error handler
app.use(require('./src/middleware/errorHandler'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Techversity API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));