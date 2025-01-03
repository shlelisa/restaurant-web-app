// Mock API for development
export const sendOTP = async (phone, otp) => {
  return new Promise((resolve) => {
    // Log OTP to console in development
    console.log(`OTP for ${phone}: ${otp}`);
    
    // Simulate API delay
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}; 