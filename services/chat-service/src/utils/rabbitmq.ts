import amqp, { Connection, Channel } from 'amqplib';

export class RabbitMQWrapper {
    private _client?: any;
    private _channel?: any;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access RabbitMQ client before connecting');
        }
        return this._client;
    }

    get channel() {
        if (!this._channel) {
            throw new Error('Cannot access RabbitMQ channel before connecting');
        }
        return this._channel;
    }

    async connect(url: string) {
        let retries = 20;
        while (retries > 0) {
            try {
                this._client = await amqp.connect(url);
                this._channel = await this._client.createChannel();
                console.log('Connected to RabbitMQ');
                return;
            } catch (err) {
                retries--;
                console.error(`Failed to connect to RabbitMQ, retrying... (${20 - retries}/20)`, err);
                await new Promise(res => setTimeout(res, 5000));
            }
        }
        throw new Error('Could not connect to RabbitMQ after multiple attempts');
    }

    async publish(exchange: string, routingKey: string, data: any) {
        if (!this._channel) {
            // Warn but don't crash if channel not ready (e.g. during startup or failover)
            console.warn('RabbitMQ channel not ready, skipping publish');
            return;
        }
        try {
            await this._channel.assertExchange(exchange, 'topic', { durable: true });
            this._channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
            console.log(`Published event to ${exchange}`);
        } catch (err) {
            console.error('Error publishing message', err);
        }
    }
}

export const rabbitWrapper = new RabbitMQWrapper();
