import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory OTP storage for OTP simulation
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'LaborLink Express Server API running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Route: Send OTP (mock SMS)
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Generate a mock 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store it (valid for 5 minutes)
  otpStore[phone] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  console.log(`[SMS-MOCK] Sending OTP: ${otp} to phone number: ${phone}`);

  // In production, you would connect to Twilio, Firebase Auth, or another provider.
  // For easy testing, we return the OTP in the response body along with instructions.
  return res.json({
    success: true,
    message: `OTP sent successfully to ${phone} (Mock mode).`,
    otp: otp // Included in response for developer testing convenience
  });
});

// Route: Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required.' });
  }

  const record = otpStore[phone];
  if (!record) {
    return res.status(400).json({ error: 'No OTP requested for this phone number.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ error: 'OTP has expired.' });
  }

  // Allow "123456" as a master bypass code for testing, otherwise check match
  if (otp === record.otp || otp === '123456') {
    delete otpStore[phone]; // Clean up
    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      token: `mock-jwt-token-for-${phone}`
    });
  }

  return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
});

// Route: Aadhaar Verification (Mock OCR API)
app.post('/api/verify-aadhaar', (req: Request, res: Response) => {
  const { aadhaarNumber, fullName } = req.body;
  if (!aadhaarNumber || !fullName) {
    return res.status(400).json({ error: 'Aadhaar number and Full Name are required.' });
  }

  // Clean Aadhaar formatting (should be 12 digits)
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return res.status(400).json({ error: 'Aadhaar must be a 12-digit number.' });
  }

  // Simulate OCR validation delay
  setTimeout(() => {
    // Mock successful verification
    return res.json({
      success: true,
      message: 'Aadhaar successfully verified via secure simulation.',
      details: {
        verifiedName: fullName,
        aadhaarMasked: `XXXX-XXXX-${cleanAadhaar.slice(-4)}`,
        status: 'VERIFIED_ACTIVE'
      }
    });
  }, 1000);
});

// Start server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`LaborLink Express server listening on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
