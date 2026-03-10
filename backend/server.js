const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./src/routes/api');

const app = express();

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Mitigate DoS attacks and brute force via rate limiting
const limiter = rateLimit({
    max: 200, // max 200 requests
    windowMs: 10 * 60 * 1000, // per 10 minutes
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Restrict incoming JSON payload sizes strictly to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

module.exports = app;
