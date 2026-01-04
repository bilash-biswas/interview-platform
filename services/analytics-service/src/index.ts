import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const analyticsSchema = new mongoose.Schema({
    eventType: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

const start = async () => {
    try {
        if (!process.env.RABBITMQ_URL || !process.env.MONGO_URI) {
            throw new Error('RABBITMQ_URL and MONGO_URI must be defined');
        }
        const rabbitUrl = process.env.RABBITMQ_URL;
        const mongoUri = process.env.MONGO_URI;

        let connected = false;
        let dbRetries = 20;
        while (dbRetries > 0 && !connected) {
            try {
                await mongoose.connect(mongoUri);
                console.log('Connected to MongoDB');
                connected = true;
            } catch (err) {
                dbRetries--;
                console.error(`Failed to connect to MongoDB, retrying... (${20 - dbRetries}/20)`);
                await new Promise(res => setTimeout(res, 5000));
            }
        }

        if (!connected) {
            throw new Error('Failed to connect to MongoDB after retries');
        }

        let connection;
        let channel;
        let retries = 20;
        while (retries > 0) {
            try {
                connection = await amqp.connect(rabbitUrl);
                channel = await connection.createChannel();
                console.log('Connected to RabbitMQ');
                break;
            } catch (err) {
                retries--;
                console.error(`Failed to connect to RabbitMQ, retrying... (${20 - retries}/20)`);
                await new Promise(res => setTimeout(res, 5000));
            }
        }

        if (!connection || !channel) {
            throw new Error('Failed to connect to RabbitMQ after retries');
        }
        
        const exchange = 'chat_events';
        await channel.assertExchange(exchange, 'topic', { durable: true });

        const q = await channel.assertQueue('analytics_queue', { durable: true });
        
        // Bind to all events
        channel.bindQueue(q.queue, exchange, '#');

        console.log("Waiting for messages in %s", q.queue);

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const key = msg.fields.routingKey;

                console.log(" [x] Analytics received '%s': %s", key, content);

                const record = new Analytics({ eventType: key, data: content });
                await record.save();

                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error(err);
    }
};

start();
