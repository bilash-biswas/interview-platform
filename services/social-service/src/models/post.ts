import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    creatorId: { type: String, required: true },
    creatorName: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    type: { type: String, enum: ['post', 'reel', 'quote'], default: 'post' },
    likes: [{ type: String }], // User IDs
    shares: { type: Number, default: 0 },
    comments: [{
        userId: String,
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
        replies: [{
            userId: String,
            username: String,
            text: String,
            createdAt: { type: Date, default: Date.now }
        }]
    }]
}, { 
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            const result = ret as any;
            result.id = result._id;
            delete result._id;
            delete result.__v;
            return result;
        }
    }
});

export const Post = mongoose.model('Post', postSchema);
