import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true
  },
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Message = mongoose.model('Message', messageSchema);

export { Message };
