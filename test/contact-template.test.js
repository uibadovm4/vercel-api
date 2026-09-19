import test from 'node:test';
import assert from 'node:assert/strict';
import { generateContactEmail } from '../src/email/contact-template.js';

test('contact email template escapes fields and includes HTML and plain text content', () => {
  const email = generateContactEmail({
    name: '<img src=x onerror=alert(1)>',
    email: 'sender@example.com',
    subject: 'Question',
    message: '<script>alert(1)</script>\nHello',
    receivedAt: '2026-09-18T12:00:00.000Z'
  });

  assert.equal(email.html.includes('<img'), false);
  assert.equal(email.html.includes('<script>'), false);
  assert.equal(email.html.includes('&lt;script&gt;'), true);
  assert.equal(email.html.includes('mailto:sender%40example.com'), true);
  assert.equal(email.html.includes('Reply to &lt;img'), true);
  assert.equal(email.text.includes('<script>alert(1)</script>'), true);
  assert.equal(email.text.includes('Hello'), true);
});