const Kavenegar = require('kavenegar');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

console.log('Loaded API key:', process.env.KAVENEGAR_API_KEY);
console.log('Sender:', process.env.KAVENEGAR_SENDER);
const otpStore = {};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP for 5 minutes
const saveOTP = (key, otp) => {
  otpStore[key] = otp;

  setTimeout(() => {
    delete otpStore[key];
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (key, otp) => {
  return otpStore[key] === otp;
};

// Clear OTP
const clearOTP = (key) => {
  delete otpStore[key];
};

// Send verification code using Kavenegar
const api = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY,
});

const sendVerificationCode = (phone, code) => {
  return new Promise((resolve, reject) => {
    api.VerifyLookup(
      {
        receptor: `0${phone.replace(/^98/, '')}`,
        token: code,
        template: process.env.KAVENEGAR_TEMPLATE_NAME,
      },
      (response, status) => {
        console.log('Kavenegar status:', status);
        console.log('Kavenegar response:', response);

        if (status !== 200) {
          return reject(
            new Error('خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.')
          );
        }

        resolve(response);
      }
    );
  });
};
// Mock function to simulate sending OTP for email
const sendMockOTP = (key, otp) => {
  console.log(`Mock OTP sent to ${key}: ${otp}`);
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  clearOTP,
  sendMockOTP,
  sendVerificationCode,
};
