import twillio from "twilio";
import { logger } from "./logger";

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const from = process.env.TWILLIO_NUMBER;

const client  = twillio(accountSid,authToken);

export const sendMessage = async (phoneNumber: string) => {
    try {
        let toNumber = phoneNumber
        if(!toNumber.startsWith('+')) {
            toNumber ='+91'+ toNumber
        };
        const message = await client.messages.create({
            body: "You logged in to your account",
            from: from,
            to: toNumber,
        });
        logger.info(`Message sent to ${toNumber} with SID ${message.sid}`);
    } catch (error) {
        logger.error(`Error sending message to ${phoneNumber}: ${error}`);
        throw error;
    }
}