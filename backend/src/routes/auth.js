import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }
  return null;
}

async function sendOtpEmail(email, otp) {
  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your verification code - Advik Creation',
      text: `Your OTP for checkout verification is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #b91c1c;">Advik Creation</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          <p style="color: #666;">This code expires in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } else {
    // Dev mode: log to console
    console.log(`[OTP for ${email}]: ${otp} (valid for 10 min)`);
  }
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const otp = generateOtp();
    otpStore.set(trimmed, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

    await sendOtpEmail(trimmed, otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    const trimmed = (email || '').trim().toLowerCase();
    const otpStr = String(otp || '').trim();

    if (!trimmed || !otpStr) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const stored = otpStore.get(trimmed);
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(trimmed);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (stored.otp !== otpStr) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    otpStore.delete(trimmed);

    // Return a simple "session" token - in production use JWT
    const token = crypto.randomBytes(32).toString('hex');
    res.json({
      success: true,
      email: trimmed,
      token,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

export default router;
