import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// OTP sending endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // For development, just log the OTP
    console.log(`OTP for ${phone}: ${otp}`);

    // In production, use Africa's Talking
    if (process.env.NODE_ENV === 'production') {
      const credentials = {
        apiKey: process.env.REACT_APP_AFRICASTALKING_API_KEY,
        username: process.env.REACT_APP_AFRICASTALKING_USERNAME
      };

      const AfricasTalking = require('africastalking')(credentials);
      const sms = AfricasTalking.SMS;

      await sms.send({
        to: phone,
        message: `Koodii mirkaneessaa keessan: ${otp}. Koodiin kun hanga daqiiqaa 5 qofa hojjeta.`,
        from: 'NyaataAadaa'
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OTP erguu hin dandeenye'
    });
  }
});

export default app; 