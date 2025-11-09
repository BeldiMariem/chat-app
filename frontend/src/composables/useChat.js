import { ref, computed, onUnmounted } from 'vue';
import { chatService } from '../services/grpc/chatService.js';

export function useChat() {
  const messages = ref([]);
  const currentMessage = ref('');
  const roomId = ref('general');
  const status = ref('Ready to connect');
  const isLoading = ref(false);
  const isAuthenticated = ref(false);
  const currentUser = ref({});
  const authError = ref('');
  const userMap = ref(new Map());
  const isConnected = ref(false);

  let messageStream = null;
  let pollingInterval = null;

  const canSendMessage = computed(() => (
    isAuthenticated.value &&
    roomId.value.trim() &&
    !isLoading.value &&
    isConnected.value
  ));

  const connectionParamsValid = computed(() => (
    isAuthenticated.value && roomId.value.trim()
  ));

  const ensureMessageUsernames = (messageArray) => {
    return messageArray.map(message => {
      if (message.username) return message;

      const storedUsername = userMap.value.get(message.userId);
      if (storedUsername) {
        return { ...message, username: storedUsername };
      }

      if (message.userId === currentUser.value?.userId) {
        const username = currentUser.value?.username;
        userMap.value.set(message.userId, username);
        return { ...message, username };
      }

      const fallbackUsername = `User_${message.username}`;
      userMap.value.set(message.userId, fallbackUsername);
      return { ...message, username: fallbackUsername };
    });
  };

  const updateUserMap = (userId, username) => {
    if (userId && username) {
      userMap.value.set(userId, username);
    }
  };

  const setLoadingState = (loading, newStatus = '') => {
    isLoading.value = loading;
    if (newStatus) {
      status.value = newStatus;
    }
  };

  const handleAuthResult = (result, successMessage) => {
    if (result.success) {
      isAuthenticated.value = true;
      currentUser.value = {
        username: result.username,
        userId: result.userId
      };

      updateUserMap(result.userId, result.username);
      status.value = successMessage;
      authError.value = '';
      return result;
    } else {
      authError.value = result.error || 'Operation failed';
      status.value = `${successMessage.split(' ')[0]} failed`;
      throw new Error(result.error || 'Operation failed');
    }
  };

  const handleApiError = (error, operation) => {
    const errorMessage = `Failed to ${operation}: ${error.message}`;
    status.value = errorMessage;
    console.error(`${operation} error:`, error);
    throw error;
  };

  const startPolling = () => {
    stopPolling();
    console.log('🔄 STARTING POLLING - will check for new messages every 2 seconds');

    const pollImmediately = async () => {
      try {
        console.log('📡 POLLING: Checking for new messages...');
        await loadMessageHistory();
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    pollImmediately();

    pollingInterval = setInterval(pollImmediately, 2000);
  };
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('🛑 Polling stopped');
    }
  };

  const connectToRoom = async () => {
    if (isConnected.value) {
      console.log('Already connected to room');
      return;
    }

    try {
      setLoadingState(true, 'Connecting to room...');

      await loadMessageHistory();

      console.log('🔄 FORCING POLLING MODE (streaming is broken)');
      startPolling();
      isConnected.value = true;
      status.value = `Connected to room: ${roomId.value} (Polling - 2s intervals)`;

      console.log('✅ Now using polling - messages should appear automatically every 2 seconds');

    } catch (error) {
      console.error('Connection error:', error);
      startPolling();
      isConnected.value = true;
      status.value = `Connected to room: ${roomId.value} (Polling fallback)`;
    } finally {
      setLoadingState(false);
    }
  };

  const disconnectFromRoom = () => {
    stopMessageStream();
    stopPolling();
    isConnected.value = false;
    clearMessages();
    status.value = `Disconnected from room: ${roomId.value}`;
  };

  const toggleRoomConnection = async () => {
    if (isConnected.value) {
      disconnectFromRoom();
    } else {
      await connectToRoom();
    }
  };

  const register = async (username, password) => {
    try {
      setLoadingState(true, 'Registering...');
      authError.value = '';

      const result = await chatService.register(username, password);
      return handleAuthResult(result, 'Registration successful!');
    } catch (error) {
      authError.value = error.message;
      status.value = 'Registration failed';
      throw error;
    } finally {
      setLoadingState(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoadingState(true, 'Logging in...');
      authError.value = '';

      const result = await chatService.login(username, password);
      return handleAuthResult(result, 'Login successful!');
    } catch (error) {
      authError.value = error.message;
      status.value = 'Login failed';
      throw error;
    } finally {
      setLoadingState(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');

    isAuthenticated.value = false;
    currentUser.value = {};
    authError.value = '';
    disconnectFromRoom();
    userMap.value.clear();
    status.value = 'Logged out';
  };

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('chat_token');
      const userStr = localStorage.getItem('chat_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        const result = await chatService.validateToken(token);
        if (result.valid) {
          isAuthenticated.value = true;
          currentUser.value = user;
          updateUserMap(user.userId, user.username);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
      return false;
    }
  };

  const sendMessage = async (messageContent) => {
    if (!canSendMessage.value) {
      console.log('❌ Cannot send message - validation failed');
      return;
    }

    try {
      setLoadingState(true, 'Sending message...');

      const userId = currentUser.value?.userId || '';
      if (!userId) {
        throw new Error('User ID not available');
      }
      const username = currentUser.value?.username || '';

      const response = await chatService.sendMessage(userId, username, messageContent, roomId.value);

      const newMessage = {
        messageId: response.messageId,
        userId: response.userId,
        username: 'user_' + response.username,
        content: response.content,
        timestamp: response.timestamp,
        roomId: response.roomId
      };

      updateUserMap(response.userId, newMessage.username);
      messages.value.push(newMessage);

      status.value = 'Message sent successfully';
      return response;
    } catch (error) {
      handleApiError(error, 'send message');
    } finally {
      setLoadingState(false);
    }
  };

  const loadMessageHistory = async () => {
    try {
      console.log('📚 Loading message history for room:', roomId.value);

      const historyMessages = await chatService.getMessageHistory(roomId.value);
      console.log('📊 Raw history messages:', historyMessages);

      const messagesWithUsernames = ensureMessageUsernames(historyMessages);
      const reversedMessages = messagesWithUsernames.reverse();

      console.log(`🔄 Updating UI: ${reversedMessages.length} messages (was ${messages.value.length})`);

      messages.value.length = 0;
      messages.value.push(...reversedMessages);

      console.log('✅ Messages array after update:', messages.value.map(m => ({
        id: m.messageId,
        content: m.content,
        user: m.username
      })));

      return historyMessages;
    } catch (error) {
      console.error('❌ Failed to load history:', error);
      throw error;
    }
  };

  const startMessageStream = () => {
    try {
      stopMessageStream();

      messageStream = chatService.streamMessages(roomId.value, {
        onMessage: (message) => {
          console.log('💬 useChat: New real-time message received:', message);

          const messageWithUsername = ensureMessageUsernames([message])[0];

          const isDuplicate = messages.value.some(
            msg => msg.messageId === messageWithUsername.messageId
          );

          if (!isDuplicate) {
            console.log('✅ useChat: Adding new message to UI');
            messages.value.push(messageWithUsername);
          }
        },
        onError: (error) => {
          console.error('❌ useChat: Stream error:', error);
          startPolling();
          status.value = `Connected to room: ${roomId.value} (Polling fallback)`;
        },
        onEnd: () => {
          console.log('🔚 useChat: Stream ended');
          messageStream = null;
          startPolling();
          status.value = `Connected to room: ${roomId.value} (Polling)`;
        }
      });

      console.log('🔛 Message stream started successfully');
      return true;
    } catch (error) {
      console.error('❌ useChat: Error starting stream:', error);
      return false;
    }
  };

  const stopMessageStream = () => {
    if (messageStream) {
      messageStream.cancel();
      messageStream = null;
      console.log('🔚 Message stream stopped');
    }
  };

  const clearMessages = () => {
    messages.value = [];
    console.log('🗑️ Messages cleared');
  };

  onUnmounted(() => {
    disconnectFromRoom();
  });

  return {
    messages,
    currentMessage,
    roomId,
    status,
    isLoading,
    isAuthenticated,
    currentUser,
    authError,
    isConnected,

    register,
    login,
    logout,
    checkAuthentication,

    sendMessage,
    loadMessageHistory,
    startMessageStream,
    stopMessageStream,
    clearMessages,

    connectToRoom,
    disconnectFromRoom,
    toggleRoomConnection,

    canSendMessage,
    connectionParamsValid
  };
}