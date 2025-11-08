import { ref, computed, onUnmounted } from 'vue';
import { chatService } from '../services/grpc/chatService.js';

export function useChat() {
  const messages = ref([]);
  const currentMessage = ref('');
  const userId = ref('');
  const roomId = ref('general');
  const status = ref('Ready to connect');
  const isLoading = ref(false);

  let messageStream = null;

  const sendMessage = async (messageContent) => {
    if (!canSendMessage.value) return;

    try {
      isLoading.value = true;
      status.value = 'Sending message...';

      const response = await chatService.sendMessage(
        userId.value,
        messageContent,
        roomId.value
      );

      status.value = 'Message sent successfully';
      return response;
    } catch (error) {
      status.value = `Failed to send message: ${error.message}`;
      console.error('Send message error:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMessageHistory = async () => {
    try {
      isLoading.value = true;
      status.value = 'Loading message history...';

      const historyMessages = await chatService.getMessageHistory(roomId.value);
      messages.value = historyMessages.reverse();

      status.value = `Loaded ${historyMessages.length} messages`;
      return historyMessages;
    } catch (error) {
      status.value = `Failed to load history: ${error.message}`;
      console.error('Load history error:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const startMessageStream = () => {
    try {
      stopMessageStream();

      messageStream = chatService.streamMessages(roomId.value, {
        onMessage: (message) => {
          const isDuplicate = messages.value.some(
            msg => msg.messageId === message.messageId
          );

          if (!isDuplicate) {
            messages.value.push(message);
          }
        },
        onError: (error) => {
          status.value = `Stream error: ${error.message}`;
          console.error('Stream error:', error);
        },
        onEnd: () => {
          status.value = 'Stream ended';
          messageStream = null;
        }
      });

      status.value = 'Stream started successfully';
      return messageStream;
    } catch (error) {
      status.value = `Failed to start stream: ${error.message}`;
      console.error('Start stream error:', error);
      throw error;
    }
  };

  const stopMessageStream = () => {
    if (messageStream) {
      messageStream.cancel();
      messageStream = null;
      status.value = 'Stream stopped';
    }
  };

  const clearMessages = () => {
    messages.value = [];
  };

  const canSendMessage = computed(() => {
    return (
      currentMessage.value.trim() &&
      userId.value.trim() &&
      roomId.value.trim() &&
      !isLoading.value
    );
  });

  const connectionParamsValid = computed(() => {
    return userId.value.trim() && roomId.value.trim();
  });

  onUnmounted(() => {
    stopMessageStream();
  });

  return {
    messages,
    currentMessage,
    userId,
    roomId,
    status,
    isLoading,
    sendMessage,
    loadMessageHistory,
    startMessageStream,
    stopMessageStream,
    clearMessages,
    canSendMessage,
    connectionParamsValid
  };
}