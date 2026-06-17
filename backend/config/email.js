const nodemailer = require('nodemailer');

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    requireTLS: true,
    pool: process.env.NODE_ENV === 'production',
    maxConnections: 5,
    maxMessages: 100
  });

  return transporter;
};

// Send email helper
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Nambikkai Fund" <noreply@nambikkai.fund>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`, {
      to: options.to,
      subject: options.subject
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errDetails = {
      error: error.message,
      code: error.code,
      command: error.command,
      to: options.to,
      subject: options.subject
    };
    console.error('❌ Email sending error:', errDetails);
    
    // Return error info instead of throwing - allows graceful fallback
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // Welcome email
  welcome: (userName) => ({
    subject: 'Welcome to Nambikkai Fund - Together We Can Make a Difference',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Nambikkai Fund</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .header { text-align: center; color: #1976d2; margin-bottom: 30px; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🕊️ Nambikkai Fund</h1>
            <h2>Give Hope, Save Lives</h2>
          </div>
          <p>Dear ${userName},</p>
          <p>Welcome to Nambikkai Fund! We're thrilled to have you join our community of compassionate individuals dedicated to making a difference in the lives of those facing medical challenges.</p>
          <p>Your journey of giving starts here. Together, we can bring hope and healing to those who need it most.</p>
          <center>
            <a href="${process.env.FRONTEND_URL}" class="btn">Start Exploring</a>
          </center>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
            <p>Please do not reply to this email. This is an automated message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Email verification
  verifyEmail: (verificationUrl) => ({
    subject: 'Verify Your Email - Nambikkai Fund',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📧 Verify Your Email</h1>
          <p>Thank you for registering with Nambikkai Fund! Please verify your email address by clicking the button below:</p>
          <center>
            <a href="${verificationUrl}" class="btn">Verify Email</a>
          </center>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password reset
  resetPassword: (resetUrl) => ({
    subject: 'Reset Your Password - Nambikkai Fund',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Reset Your Password</h1>
          <p>You requested a password reset. Click the button below to create a new password:</p>
          <center>
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </center>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Campaign approved
  campaignApproved: (campaignTitle, campaignUrl) => ({
    subject: '🎉 Your Campaign Has Been Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .btn { display: inline-block; background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Congratulations!</h1>
          <p>Your campaign "<strong>${campaignTitle}</strong>" has been approved and is now live!</p>
          <p>Your campaign is now visible to donors and you can start receiving donations.</p>
          <center>
            <a href="${campaignUrl}" class="btn">View Your Campaign</a>
          </center>
          <p>Remember to share your campaign with your network to maximize reach and donations.</p>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Campaign rejected
  campaignRejected: (campaignTitle, reason) => ({
    subject: 'Update Required: Campaign Needs Changes',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Needs Changes</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .reason { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Campaign Update Required</h1>
          <p>Your campaign "<strong>${campaignTitle}</strong>" needs some changes before it can go live.</p>
          <div class="reason">
            <strong>Reason:</strong><br>
            ${reason}
          </div>
          <p>Please update your campaign and resubmit for verification. Our team will review it again promptly.</p>
          <center>
            <a href="${process.env.FRONTEND_URL}/dashboard/campaigns" class="btn">Edit Campaign</a>
          </center>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Donation received
  donationReceived: (donorName, amount, campaignTitle) => ({
    subject: '🎁 New Donation Received!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .amount { font-size: 28px; color: #4caf50; font-weight: bold; text-align: center; margin: 20px 0; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💝 Donation Received!</h1>
          <p>Great news! Your campaign "<strong>${campaignTitle}</strong>" has received a new donation.</p>
          <p><strong>Donor:</strong> ${donorName || 'Anonymous'}</p>
          <div class="amount">₹${amount}</div>
          <center>
            <a href="${process.env.FRONTEND_URL}/dashboard/campaigns" class="btn">View Dashboard</a>
          </center>
          <p>Thank you for your important work. Keep sharing your campaign!</p>
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Withdrawal request
  withdrawalRequest: (amount, status) => ({
    subject: `Withdrawal Request ${status === 'approved' ? 'Approved' : 'Received'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .amount { font-size: 28px; color: #1976d2; font-weight: bold; text-align: center; margin: 20px 0; }
          .status { text-align: center; padding: 10px; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .approved { background: #d4edda; color: #155724; }
          .pending { background: #fff3cd; color: #856404; }
          .rejected { background: #f8d7da; color: #721c24; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏦 Withdrawal Request</h1>
          <p>Your withdrawal request for <div class="amount">₹${amount}</div> has been <span class="status ${status}">${status.toUpperCase()}</span>.</p>
          ${status === 'approved' ?
            '<center><a href="#" class="btn" style="background: #4caf50;">Funds Transfer Initiated</a></center>' :
            status === 'rejected' ?
            '<p>Please check your bank details or contact support for more information.</p>' :
            '<p>Our team is reviewing your request. You will be notified once it is processed.</p>'
          }
          <div class="footer">
            <p>© 2024 Nambikkai Fund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
