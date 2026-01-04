import express, { Request, Response } from 'express';
import { Message } from '../models/message';

const router = express.Router();

// Get message history for a room
router.get('/history/:roomId', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await Message.find({ roomId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get conversations for a user
router.get('/conversations/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Find latest message for each room the user is part of
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { recipientId: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$roomId',
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Mark messages in a room as read
router.post('/read/:roomId', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body;

        await Message.updateMany(
            { roomId, recipientId: userId, status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

export { router as chatRouter };
