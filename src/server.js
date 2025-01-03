import express from 'express';
import cors from 'cors';
import sendOTPRouter from './api/sendOTP';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', sendOTPRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 