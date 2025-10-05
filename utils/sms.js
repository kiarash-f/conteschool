const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
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
// Mock function to simulate sending OTP for email
const sendMockOTP = (key, otp) => {
  console.log(`Mock OTP sent to ${key}: ${otp}`);
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
    });
    console.log('SMS sent. Reference ID:', referenceID);
    return referenceID;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
const notifyAdminSMS = async (payment, course, student) => {
  try {
    const text = `پرداخت موفق: 
دوره: ${course.title}
دانشجو: ${student.name}
مبلغ: ${payment.amount}
کد پیگیری: ${payment.ref_id}`;

    const referenceID = await message.sendSMS({
      mobile: process.env.ADMIN_MOBILE,
      message: text,
      method: 'sms',
    });

    console.log('Admin notified. Ref ID:', referenceID);
    return referenceID;
  } catch (error) {
    console.error('Error sending Admin SMS:', error);
    throw error;
  }
};

module.exports = {
  notifyAdminSMS,
  generateOTP,
  saveOTP,
  verifyOTP,
  clearOTP,
  sendMockOTP,
  sendOtpSMS,
  otpStore,
  message,
};
