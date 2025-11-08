import { ref, computed } from 'vue';
import { grpcClient } from '../services/grpc/client.js';

export function useGrpcClient() {
  const connectionStatus = ref('disconnected');
  const error = ref(null);

  const connect = async () => {
    try {
      connectionStatus.value = 'connecting';
      error.value = null;
      
      await grpcClient.connect();
      connectionStatus.value = 'connected';
      
      return true;
    } catch (err) {
      connectionStatus.value = 'error';
      error.value = err.message;
      return false;
    }
  };

  const disconnect = () => {
    grpcClient.disconnect();
    connectionStatus.value = 'disconnected';
    error.value = null;
  };

  const isConnected = computed(() => connectionStatus.value === 'connected');
  const isConnecting = computed(() => connectionStatus.value === 'connecting');
  const hasError = computed(() => connectionStatus.value === 'error');

  return {
    connectionStatus,
    error,
    isConnected,
    isConnecting,
    hasError,
    connect,
    disconnect
  };
}