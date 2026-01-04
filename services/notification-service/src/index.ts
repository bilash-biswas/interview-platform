import amqp from 'amqplib';
import dotenv from 'dotenv';
import { setupSocketServer } from './socket';

dotenv.config();

const start = async () => {
    try {
        const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || '3005');
        const messagingManager = setupSocketServer(SOCKET_PORT);

        if (!process.env.RABBITMQ_URL) {
            throw new Error('RABBITMQ_URL must be defined');
        }
        const rabbitUrl = process.env.RABBITMQ_URL;

        let connection;
        let channel;
        const maxRetries = 20;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                connection = await amqp.connect(rabbitUrl);
                channel = await connection.createChannel();
                console.log('Connected to RabbitMQ');
                break;
            } catch (err) {
                retries++;
                console.log(`RabbitMQ connection failed. Retrying in 5s... (${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!connection || !channel) {
            throw new Error('Could not connect to RabbitMQ after multiple retries');
        }
        
        const exchange = 'chat_events';
        await channel.assertExchange(exchange, 'topic', { durable: true });

        const q = await channel.assertQueue('notification_queue', { durable: true });
        
        channel.bindQueue(q.queue, exchange, '#');

        console.log("Waiting for messages in %s", q.queue);

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const key = msg.fields.routingKey;

                console.log(" [x] Received '%s': %s", key, content.content || content.text || 'Notification');

                // Deliver via Custom Messaging Service (Socket.io)
                if (key === 'message.created') {
                    // content.receiverId or loop through participants
                    if (content.receiverId) {
                        messagingManager.sendToUser(content.receiverId, 'notification', {
                            type: 'new_message',
                            title: 'New Message',
                            body: content.content || 'You have a new message',
                            data: content
                        });
                    } else if (content.roomMembers) {
                        content.roomMembers.forEach((memberId: string) => {
                            if (memberId !== content.senderId) {
                                messagingManager.sendToUser(memberId, 'notification', {
                                    type: 'new_message',
                                    title: 'New Message',
                                    body: content.content || 'You have a new message',
                                    data: content
                                });
                            }
                        });
                    }
                } else if (key === 'exam.invited') {
                    messagingManager.broadcast('notification', {
                        type: 'exam_invite',
                        title: 'New Exam Invitation',
                        body: `New Exam: "${content.title}"`,
                        data: content
                    });
                }

                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error(err);
    }
};

start();
