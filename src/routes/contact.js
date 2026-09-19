import { Router } from 'express';
import nodemailer from 'nodemailer';
import { fail, ok } from '../utils.js';
import { generateContactEmail } from '../email/contact-template.js';

const router = Router();
router.post('/', async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body || {};
  const validPhone = typeof phone === 'string' && /^[+()\d\s.-]{7,25}$/.test(phone.trim()) && phone.replace(/\D/g, '').length >= 7;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !validPhone || !subject?.trim() || !message?.trim()) return fail(res, 'Name, valid email, phone, subject, and message are required');
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.CONTACT_EMAIL) {
    return fail(res, 'Email service is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and CONTACT_EMAIL to the Vercel Production environment.', 503);
  }
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  try {
    const emailContent = generateContactEmail({ name, email, phone, subject, message });
    await transporter.sendMail({ from: process.env.SMTP_USER, to: process.env.CONTACT_EMAIL, replyTo: email, subject: `[Contact] ${subject}`, html: emailContent.html, text: emailContent.text });
    return ok(res, { message: 'Message sent successfully' }, 202);
  } catch (error) {
    next(error);
  }
});
export default router;