import { createConsumer, Consumer } from '@rails/actioncable';
import { HOST_API } from 'src/config-global';

let consumer: Consumer | null = null;

export function getCableConsumer(): Consumer | null {
  if (consumer) return consumer;

  const token = sessionStorage.getItem('accessToken');
  if (!token || !HOST_API) return null;

  const wsProtocol = HOST_API.startsWith('https') ? 'wss' : 'ws';
  const host = HOST_API.replace(/^https?:\/\//, '');
  const url = `${wsProtocol}://${host}/cable?token=${token}`;

  consumer = createConsumer(url);
  return consumer;
}

export function disconnectCable() {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
  }
}
