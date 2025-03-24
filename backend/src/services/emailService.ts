import transporter from '../config/nodemailerConfig';
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
}

export const sendEmail = async (to: EmailOptions['to'], subject: EmailOptions['subject'], text: EmailOptions['text']): Promise<void> => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER as string,
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error sending email: ${error.message}`);
        } else {
            console.error('Error sending email: Unknown error');
        }
    }
};