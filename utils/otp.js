

const otpStore = {};

// Generate 6-digit OTP as a string
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP for a key (phone or email) with expiry of 5 minutes
exports.saveOTP = (key, otp) => {
  otpStore[key] = otp;

  
  setTimeout(() => {
    delete otpStore[key];
  }, 5 * 60 * 1000);
};

// Verify OTP for a key
exports.verifyOTP = (key, otp) => {
  return otpStore[key] === otp;
};

// Clear OTP after successful verification
exports.clearOTP = (key) => {
  delete otpStore[key];
};

// For development: Log OTP to console (replace with SMS/email sending later)
exports.sendMockOTP = (key, otp) => {
  console.log(`Mock OTP sent to ${key}: ${otp}`);
};
