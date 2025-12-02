import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Email Service Handler
 * This endpoint handles sending emails for order confirmations, notifications, etc.
 * You can integrate with services like SendGrid, Mailgun, or AWS SES
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, template, data } = req.body;

    if (!to || !subject || !template) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate email content based on template
    const emailContent = generateEmailContent(template, data);

    // Send email using your preferred service
    // Example: SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to,
    //   from: process.env.EMAIL_FROM,
    //   subject,
    //   html: emailContent,
    // });

    console.log(`Email sent to ${to}: ${subject}`);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      to,
      subject,
    });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
}

/**
 * Generate email content based on template
 */
function generateEmailContent(template: string, data: any): string {
  const templates: { [key: string]: (data: any) => string } = {
    order_confirmation: (data) => `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Total:</strong> ${data.total}</p>
      <p>Your order will be delivered soon.</p>
    `,
    order_status_update: (data) => `
      <h1>Order Status Update</h1>
      <p>Your order #${data.orderNumber} status has been updated to <strong>${data.status}</strong></p>
      <p>Estimated delivery time: ${data.estimatedDeliveryTime}</p>
    `,
    trip_confirmation: (data) => `
      <h1>Trip Confirmed</h1>
      <p>Your trip has been confirmed!</p>
      <p><strong>Driver:</strong> ${data.driverName}</p>
      <p><strong>Vehicle:</strong> ${data.vehicleType} (${data.vehicleNumber})</p>
      <p><strong>Estimated Fare:</strong> ${data.fare}</p>
    `,
    password_reset: (data) => `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
    welcome: (data) => `
      <h1>Welcome to ALMA World!</h1>
      <p>Hello ${data.userName},</p>
      <p>Thank you for joining ALMA World. We're excited to have you on board!</p>
      <p>Start exploring our services and enjoy exclusive offers.</p>
    `,
  };

  const generator = templates[template];
  if (!generator) {
    throw new Error(`Unknown email template: ${template}`);
  }

  return generator(data);
}
