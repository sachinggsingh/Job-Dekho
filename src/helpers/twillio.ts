import twillio from "twilio";
import { logger } from "./logger";

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const from = process.env.TWILLIO_NUMBER;

const client  = twillio(accountSid,authToken);

export const sendMessage = async (phoneNumber: string) => {
    try {
        const message = await client.messages.create({
            body: "You logged in to your account",
            from: from,
            to: phoneNumber,
        });
        logger.info(`Message sent to ${phoneNumber} with SID ${message.sid}`);
    } catch (error) {
        logger.error(`Error sending message to ${phoneNumber}: ${error}`);
        throw error;
    }
}