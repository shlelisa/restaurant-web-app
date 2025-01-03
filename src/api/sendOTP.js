import express from 'express';
const router = express.Router();

router.post('/send-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Send SMS using Africa's Talking
    const credentials = {
      apiKey: process.env.REACT_APP_AFRICASTALKING_API_KEY,
      username: process.env.REACT_APP_AFRICASTALKING_USERNAME
    };

    const AfricasTalking = require('africastalking')(credentials);
    const sms = AfricasTalking.SMS;

    const message = `Koodii mirkaneessaa keessan: ${otp}. Koodiin kun hanga daqiiqaa 5 qofa hojjeta.`;

    const response = await sms.send({
      to: phone,
      message: message,
      from: 'NyaataAadaa'
    });

    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OTP erguu hin dandeenye'
    });
  }
});

export default router; 