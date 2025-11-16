import { useState, useEffect, useCallback } from 'react';
import wsService from '../services/websocket';

export const useWebSocket = (url = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Conectar ao WebSocket
    if (url) {
      wsService.connect(url);
    }

    // Inscrever para receber mensagens
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === 'connection') {
        setIsConnected(data.status === 'connected');
        setError(null);
      } else if (data.type === 'error') {
        setError(data.error);
        setIsConnected(false);
      } else {
        setLastMessage(data);
      }
    });

    // Verificar status inicial
    setIsConnected(wsService.isConnected());

    return () => {
      unsubscribe();
    };
  }, [url]);

  const sendMessage = useCallback((data) => {
    wsService.send(data);
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    wsService.connect(url);
  }, [url]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    disconnect,
    reconnect
  };
};