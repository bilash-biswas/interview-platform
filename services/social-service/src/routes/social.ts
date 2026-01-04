import express, { Request, Response } from 'express';
import { Post } from '../models/post';
import { Friendship } from '../models/friendship';
import { Story } from '../models/story';

const router = express.Router();

// --- POSTS & REELS & QUOTES ---

// Create Post/Reel/Quote
router.post('/posts', async (req: any, res: Response) => {
    try {
        const post = new Post(req.body);
        await post.save();
        req.io.emit('post-update', { type: 'NEW_POST', post });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get Feed
router.get('/posts/feed', async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

// Like/Unlike Post
router.post('/posts/:id/like', async (req: any, res: Response) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();
        req.io.emit('post-update', { type: 'LIKE_UPDATE', postId: post.id, likes: post.likes });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Action failed' });
    }
});

// Add Comment
router.post('/posts/:id/comments', async (req: any, res: Response) => {
    try {
        const { userId, username, text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = { userId, username, text, createdAt: new Date(), replies: [] };
        post.comments.push(comment);
        await post.save();
        req.io.emit('post-update', { type: 'COMMENT_UPDATE', postId: post.id, comments: post.comments });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Add Reply to Comment
router.post('/posts/:id/comments/:commentId/replies', async (req: any, res: Response) => {
    try {
        const { userId, username, text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = (post.comments as any).id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        comment.replies.push({ userId, username, text, createdAt: new Date() });
        await post.save();
        req.io.emit('post-update', { type: 'COMMENT_UPDATE', postId: post.id, comments: post.comments });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

// --- FRIENDSHIPS ---

// Send Friend Request
router.post('/friends/request', async (req: any, res: Response) => {
    try {
        const { requester, requesterName, recipient, recipientName } = req.body;

        if (requester === recipient) {
            return res.status(400).json({ error: 'Cannot initiate link with oneself.' });
        }

        // Check if any connection already exists in either direction
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester, recipient },
                { requester: recipient, recipient: requester }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ 
                error: existingFriendship.status === 'accepted' 
                    ? 'Alliance already established.' 
                    : 'Alliance request pending or exists.' 
            });
        }

        const friendship = new Friendship({ requester, requesterName, recipient, recipientName, status: 'pending' });
        await friendship.save();
        req.io.emit('friend-update', { type: 'REQUEST_SENT', friendship });
        res.status(201).json(friendship);
    } catch (err: any) {
        res.status(500).json({ error: 'Request failed to transmit.' });
    }
});

// Accept Friend Request
router.post('/friends/accept', async (req: any, res: Response) => {
    try {
        const { requestId } = req.body;
        const friendship = await Friendship.findByIdAndUpdate(requestId, { status: 'accepted' }, { new: true });
        req.io.emit('friend-update', { type: 'REQUEST_ACCEPTED', friendship });
        res.json(friendship);
    } catch (err) {
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

// Get Friend List
router.get('/friends/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ error: 'Invalid User ID provided' });
        }
        const friends = await Friendship.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        });

        // Unique the list of friends by the "other" person's ID to prevent duplicates
        const seen = new Set();
        const uniqueFriends = friends.filter(f => {
            const otherId = f.requester === userId ? f.recipient : f.requester;
            if (seen.has(otherId)) return false;
            seen.add(otherId);
            return true;
        });

        // Map to ensure 'id' is present
        const formattedFriends = uniqueFriends.map(f => {
            const data = f.toJSON() as any;
            return { ...data, id: data.id || f._id.toString() };
        });

        res.json(formattedFriends);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Get Pending Friend Requests
router.get('/friends/:userId/pending', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const pending = await Friendship.find({
            recipient: userId,
            status: 'pending'
        });
        const formattedPending = pending.map(p => {
            const data = p.toJSON() as any;
            return { ...data, id: data.id || p._id.toString() };
        });
        res.json(formattedPending);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// --- USER PROFILES ---

// Get User Profile Data
router.get('/users/:id/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.query.viewerId as string;

        const posts = await Post.find({ creatorId: userId }).sort({ createdAt: -1 });
        const postCount = posts.length;
        
        // Calculate total likes received
        const totalLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);

        // Get connection status if viewer is provided
        let connectionStatus = 'none';
        if (currentUserId && currentUserId !== userId) {
            const friendship = await Friendship.findOne({
                $or: [
                    { requester: userId, recipient: currentUserId },
                    { requester: currentUserId, recipient: userId }
                ]
            });
            if (friendship) {
                connectionStatus = friendship.status; // 'pending' or 'accepted'
            }
        }

        res.json({
            userId,
            posts,
            postCount,
            totalLikes,
            connectionStatus
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// --- STORIES (MY DAYS) ---

// Create Story
router.post('/stories', async (req: Request, res: Response) => {
    try {
        const { userId, username, mediaUrl, type } = req.body;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

        const story = new Story({ userId, username, mediaUrl, type, expiresAt });
        await story.save();
        res.status(201).json(story);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create story' });
    }
});

// Get Active Stories
router.get('/stories/active', async (req: Request, res: Response) => {
    try {
        const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
});

export { router as socialRouter };
