const ACCENT = '#c6534d';
const TEXT = '#333333';
const SECONDARY = '#777777';
const BORDER = '#eeeeee';
const BACKGROUND = '#f5f5f5';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatReceivedAt(receivedAt) {
  const date = receivedAt instanceof Date ? receivedAt : new Date(receivedAt || Date.now());
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
  }) + ' UTC';
}

export function generateContactEmail({ name, email, phone = '', subject, message, receivedAt = new Date() }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const received = formatReceivedAt(receivedAt);
  const replyUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const plainText = [
    'E-commerce - New Contact Message',
    '',
    `From: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Subject: ${subject}`,
    `Date/time received: ${received}`,
    '',
    'Message:',
    message,
    '',
    `Reply to ${name}: ${replyUrl}`,
    '',
    'E-commerce',
    'Contact Form Notification',
    'This is an automated message from the E-commerce website.'
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BACKGROUND}; color:${TEXT}; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:${BACKGROUND};">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:660px; background-color:#ffffff; border:1px solid ${BORDER}; border-radius:8px; box-shadow:0 2px 8px rgba(51,51,51,0.06); overflow:hidden;">
            <tr>
              <td style="padding:28px 32px; background-color:${ACCENT}; color:#ffffff;">
                <div style="font-size:22px; line-height:28px; font-weight:bold;">E-commerce</div>
                <div style="padding-top:6px; font-size:12px; line-height:18px; letter-spacing:0.5px; text-transform:uppercase; color:#fbe9e7;">New Contact Message</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="font-size:16px; line-height:24px; font-weight:bold; color:${TEXT};">NEW CONTACT MESSAGE</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:20px; border:1px solid ${BORDER}; border-radius:7px;">
                  <tr>
                    <td style="padding:16px 18px; border-bottom:1px solid ${BORDER};">
                      <div style="font-size:12px; line-height:18px; color:${SECONDARY};">From</div>
                      <div style="padding-top:4px; font-size:15px; line-height:22px; color:${TEXT};">${safeName}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 18px; border-bottom:1px solid ${BORDER};">
                      <div style="font-size:12px; line-height:18px; color:${SECONDARY};">Email</div>
                      <div style="padding-top:4px; font-size:15px; line-height:22px;"><a href="mailto:${safeEmail}" style="color:${ACCENT}; text-decoration:underline;">${safeEmail}</a></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 18px; border-bottom:1px solid ${BORDER};">
                      <div style="font-size:12px; line-height:18px; color:${SECONDARY};">Phone</div>
                      <div style="padding-top:4px; font-size:15px; line-height:22px;"><a href="tel:${safePhone}" style="color:${ACCENT}; text-decoration:underline;">${safePhone}</a></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:12px; line-height:18px; color:${SECONDARY};">Subject</div>
                      <div style="padding-top:4px; font-size:15px; line-height:22px; color:${TEXT};">${safeSubject}</div>
                    </td>
                  </tr>
                </table>
                <div style="padding-top:28px; font-size:14px; line-height:20px; font-weight:bold; color:${TEXT};">Message</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:10px; border:1px solid ${BORDER}; border-radius:7px; background-color:#fafafa;">
                  <tr><td style="padding:18px; font-size:15px; line-height:24px; color:${TEXT};">${safeMessage}</td></tr>
                </table>
                <div style="padding-top:28px; font-size:14px; line-height:20px; font-weight:bold; color:${TEXT};">Contact Information</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:10px;">
                  <tr><td style="padding:8px 0; font-size:13px; line-height:20px; color:${SECONDARY};">Sender name</td><td align="right" style="padding:8px 0; font-size:13px; line-height:20px; color:${TEXT};">${safeName}</td></tr>
                  <tr><td style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${SECONDARY};">Sender email</td><td align="right" style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px;"><a href="mailto:${safeEmail}" style="color:${ACCENT};">${safeEmail}</a></td></tr>
                  <tr><td style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${SECONDARY};">Phone</td><td align="right" style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px;"><a href="tel:${safePhone}" style="color:${ACCENT};">${safePhone}</a></td></tr>
                  <tr><td style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${SECONDARY};">Subject</td><td align="right" style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${TEXT};">${safeSubject}</td></tr>
                  <tr><td style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${SECONDARY};">Date/time received</td><td align="right" style="padding:8px 0; border-top:1px solid ${BORDER}; font-size:13px; line-height:20px; color:${TEXT};">${escapeHtml(received)}</td></tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                  <tr><td align="center" bgcolor="${ACCENT}" style="border-radius:6px;"><a href="${replyUrl}" style="display:inline-block; padding:13px 20px; border:1px solid ${ACCENT}; border-radius:6px; color:#ffffff; font-size:14px; line-height:20px; font-weight:bold; text-decoration:none;">Reply to ${safeName}</a></td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px; border-top:1px solid ${BORDER}; background-color:#fafafa;">
                <div style="font-size:14px; line-height:20px; font-weight:bold; color:${TEXT};">E-commerce</div>
                <div style="padding-top:3px; font-size:12px; line-height:18px; color:${SECONDARY};">Contact Form Notification</div>
                <div style="padding-top:12px; font-size:12px; line-height:18px; color:${SECONDARY};">This is an automated message from the E-commerce website.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text: plainText };
}