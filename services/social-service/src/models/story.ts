import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // Auto-delete
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

export const Story = mongoose.model('Story', storySchema);
