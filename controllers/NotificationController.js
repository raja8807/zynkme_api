const { User } = require('../models');

// Helper to get Expo client lazily due to ESM require issues
let expo;
async function getExpoClient() {
    if (!expo) {
        const { Expo } = await import('expo-server-sdk');
        expo = new Expo();
    }
    return expo;
}

exports.sendNotification = async (req) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId) {
            return { message: 'User ID is required' };
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return { message: 'User not found' };
        }

        // Check if user has a push token
        // For dummy testing, we allow empty token but return a specific message
        const pushToken = user.push_token;

        if (!pushToken) {
            console.log(`Notification simulation for user ${userId}: ${title} - ${body}`);
            return {
                message: 'Notification simulation successful. No push token found for user.',
                simulated: true
            };
        }

        // Check that all your push tokens appear to be valid Expo push tokens
        const { Expo: ExpoClass } = await import('expo-server-sdk');
        if (!ExpoClass.isExpoPushToken(pushToken)) {
            return res.status(400).json({ message: `Push token ${pushToken} is not a valid Expo push token` });
        }

        // Construct the message
        let messages = [{
            to: pushToken,
            sound: 'default',
            title: title || 'Zynkme',
            body: body || 'You have a new notification',
            data: data || {},
        }];

        // Send the notification
        const expoClient = await getExpoClient();
        let chunks = expoClient.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending notification chunk:', error);
            }
        }

        console.log(tickets);
        return tickets;

    } catch (error) {
        console.error('Error in sendNotification:', error);
        return error;
    }
};


exports.sendNotificationRoute = async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a push token
        // For dummy testing, we allow empty token but return a specific message
        const pushToken = user.push_token;

        if (!pushToken) {
            console.log(`Notification simulation for user ${userId}: ${title} - ${body}`);
            return res.status(400).json({
                message: 'Notification simulation successful. No push token found for user.',
                simulated: true

            });


        }

        // Check that all your push tokens appear to be valid Expo push tokens
        const { Expo: ExpoClass } = await import('expo-server-sdk');
        if (!ExpoClass.isExpoPushToken(pushToken)) {
            return res.status(400).json({ message: `Push token ${pushToken} is not a valid Expo push token` });
        }

        // Construct the message
        let messages = [{
            to: pushToken,
            sound: 'default',
            title: title || 'Zynkme',
            body: body || 'You have a new notification',
            data: data || {},
        }];

        // Send the notification
        const expoClient = await getExpoClient();
        let chunks = expoClient.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending notification chunk:', error);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        }

        return res.status(200).json({ message: 'Notification sent successfully', tickets });


    } catch (error) {
        console.error('Error in sendNotificationRoute:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });

    }
};




exports.updatePushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;
        const userId = req.user.id; // From authMiddleware

        // If pushToken is provided as null or empty, we allow it (for logout)
        const finalToken = pushToken === undefined ? undefined : pushToken;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ push_token: finalToken });

        res.status(200).json({
            message: 'Push token updated successfully'
        });

    } catch (error) {
        console.error('Error in updatePushToken:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
