// const Kavenegar = require('kavenegar');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { MessageWay, isMessageWayError } = require('messageway');

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

const message = new MessageWay(process.env.MESSAGEWAY_API_KEY);

const sendOtpSMS = async (phone) => {
  try {
    const referenceID = await message.sendSMS({
      mobile: `${phone}`,
      templateID: 15472,
      length: 6,
      expireTime: 120,
      method: 'sms',
      // params: ['1234'], // Use if your SMS template needs variables
    });
    console.log('SMS sent. Reference ID:', referenceID);
    return referenceID;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
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
  sendOtpSMS,
  otpStore,
  message,
};
