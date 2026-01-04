import amqp from 'amqplib';

let channel: amqp.Channel | null = null;
const EXCHANGE = 'chat_events';

export const connectRabbit = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
        const connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
        console.log('Connected to RabbitMQ (Exam Service)');
    } catch (err) {
        console.error('Failed to connect to RabbitMQ:', err);
        // Retry logic could be added here similar to MongoDB
    }
};

export const publishNotification = (routingKey: string, content: any) => {
    if (!channel) return;
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(content)));
    console.log(`[x] Sent '${routingKey}':`, content);
};
