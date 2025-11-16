class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url = process.env.REACT_APP_WS_URL || 'ws://localhost:3001') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.reconnectAttempts = 0;
        this.notifySubscribers({ type: 'connection', status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        this.notifySubscribers({ type: 'error', error });
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.notifySubscribers({ type: 'connection', status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Tentando reconectar em ${delay}ms... (tentativa ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Máximo de tentativas de reconexão atingido');
      this.notifySubscribers({ 
        type: 'error', 
        error: 'Não foi possível conectar ao servidor' 
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }

  subscribe(callback) {
    const id = Date.now().toString();
    this.subscribers.set(id, callback);
    return () => this.subscribers.delete(id);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState() {
    return this.ws?.readyState;
  }
}

// Singleton
const wsService = new WebSocketService();
export default wsService;