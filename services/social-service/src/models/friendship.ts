import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
    requester: { type: String, required: true },
    requesterName: { type: String, required: true },
    recipient: { type: String, required: true },
    recipientName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
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

// Index to quickly find friendships for a user
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = mongoose.model('Friendship', friendshipSchema);
