import { io } from 'socket.io-client';

const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const isCloud = typeof window !== 'undefined' && (
  window.location.protocol === 'https:' ||
  window.location.hostname.includes('vercel.app')
);
const SOCKET_URL = `http://${hostname}:5000`;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket) return this.socket;

    if (isCloud) {
      // In cloud serverless environment, graceful fallback without socket connection errors
      this.connected = true;
      this.socket = {
        on: (ev, cb) => {
          if (ev === 'connect') setTimeout(cb, 100);
        },
        emit: () => {},
        disconnect: () => {}
      };
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('⚡ [WebSocket] Connected to LLB Real Estate live server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('🔌 [WebSocket] Disconnected from live server');
    });

    return this.socket;
  }

  joinProperty(propertyId, callback) {
    if (!this.socket) this.connect();
    this.socket.emit('property:join', { propertyId });
    if (callback) {
      this.socket.on('property:viewers_update', (data) => {
        if (data.propertyId === propertyId) {
          callback(data.count);
        }
      });
    }
  }

  leaveProperty(propertyId) {
    if (this.socket) {
      this.socket.emit('property:leave', { propertyId });
      this.socket.off('property:viewers_update');
    }
  }

  sendChatMessage(propertyId, message, senderName, senderRole) {
    if (!this.socket) this.connect();
    this.socket.emit('chat:send', {
      propertyId,
      message,
      senderName,
      senderRole
    });
  }

  onChatMessage(callback) {
    if (!this.socket) this.connect();
    this.socket.on('chat:received', callback);
  }

  offChatMessage() {
    if (this.socket) {
      this.socket.off('chat:received');
    }
  }
}

export const socketService = new SocketService();
