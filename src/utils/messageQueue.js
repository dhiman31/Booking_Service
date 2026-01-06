const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config/serverConfig');

let channel;

const createChannel = async () => {
  if (channel) return channel;

  const connection = await amqplib.connect(MESSAGE_BROKER_URL);
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  console.log('Booking MQ channel ready');

  return channel;
};

const publishMessage = async (bindingKey, data) => {
  if (!channel) throw new Error('Channel not initialized');

  channel.publish(
    EXCHANGE_NAME,
    bindingKey,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
};

module.exports = {
  createChannel,
  publishMessage
};
