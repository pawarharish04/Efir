const nodemailer = require('nodemailer');

// Create a transporter. For production, replace with Gmail or SendGrid/AWS SES.
// Using Ethereal for testing (no auth needed really, or creates on fly)
const createTransporter = async () => {
    // For a real app, use:
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    // });

    // For Development/Demo (Ethereal)
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    return transporter;
};

const sendStatusUpdateEmail = async (userEmail, userName, firId, newStatus) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"E-FIR Portal System" <no-reply@efir-system.gov>', // sender address
            to: userEmail,
            subject: `Update on FIR #${firId.slice(-6).toUpperCase()} - ${newStatus}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #1a73e8;">FIR Status Update</h2>
                    <p>Dear ${userName},</p>
                    <p>The status of your FIR (ID: <strong>#${firId.slice(-6).toUpperCase()}</strong>) has been updated.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;">Current Status:</p>
                        <h3 style="margin: 5px 0; color: #333;">${newStatus.toUpperCase()}</h3>
                    </div>

                    <p>You can login to your dashboard to view more details and download the updated status report.</p>
                    <br>
                    <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
                </div>
            `,
        });

        console.log("📨 Email sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendStatusUpdateEmail };
