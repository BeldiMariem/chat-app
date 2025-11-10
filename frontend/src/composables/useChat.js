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

  const paginationLimit = ref(5);
  const currentPage = ref(1);
  const hasMoreMessages = ref(false);
  const isLoadingMore = ref(false);
  const allMessagesLoaded = ref([]);

  let messageStream = null;
  let pollingInterval = null;
  const pendingMessageConfirmations = ref(new Set());
  const confirmedMessageIds = ref(new Set());

  const isSendingMessage = computed(() => {
    return isLoading.value || pendingMessageConfirmations.value.size > 0;
  });
  const isWaitingForMessageConfirmation = computed(() => {
    return pendingMessageConfirmations.value.size > 0;
  });
  const canSendMessage = computed(() => (
    isAuthenticated.value &&
    roomId.value.trim() &&
    !isLoading.value &&
    isConnected.value
  ));

  const connectionParamsValid = computed(() => (
    isAuthenticated.value && roomId.value.trim()
  ));

  const displayedMessages = computed(() => {
    const totalMessages = allMessagesLoaded.value.length;
    const startIndex = Math.max(0, totalMessages - (currentPage.value * paginationLimit.value));
    return allMessagesLoaded.value.slice(startIndex);
  });

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
    throw error;
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore.value || !hasMoreMessages.value) return;

    try {
      isLoadingMore.value = true;
      currentPage.value++;

      const totalMessages = allMessagesLoaded.value.length;
      const currentlyShowing = currentPage.value * paginationLimit.value;
      hasMoreMessages.value = totalMessages > currentlyShowing;

    } catch (error) {
      currentPage.value--;
    } finally {
      isLoadingMore.value = false;
    }
  };

  const loadMessageHistory = async () => {
    try {
      const historyMessages = await chatService.getMessageHistory(roomId.value, 1000);
      const messagesWithUsernames = ensureMessageUsernames(historyMessages);

      allMessagesLoaded.value = messagesWithUsernames.reverse();

      currentPage.value = 1;
      const totalMessages = allMessagesLoaded.value.length;
      hasMoreMessages.value = totalMessages > paginationLimit.value;

      return historyMessages;
    } catch (error) {
      throw error;
    }
  };
  const startPolling = () => {
    stopPolling();

    let errorCount = 0;
    const baseDelay = 10000;
    const maxDelay = 30000;

    const pollImmediately = async () => {
      try {

        const historyMessages = await chatService.getMessageHistory(roomId.value, 50);
        const messagesWithUsernames = ensureMessageUsernames(historyMessages);

        const newMessages = messagesWithUsernames.reverse();

        let hasNewConfirmations = false;
        newMessages.forEach(message => {
          if (pendingMessageConfirmations.value.has(message.messageId) &&
            !confirmedMessageIds.value.has(message.messageId)) {
            confirmedMessageIds.value.add(message.messageId);
            pendingMessageConfirmations.value.delete(message.messageId);
            hasNewConfirmations = true;
          }
        });

        const currentMessageIds = allMessagesLoaded.value.map(m => m.messageId).join(',');
        const newMessageIds = newMessages.map(m => m.messageId).join(',');

        if (currentMessageIds !== newMessageIds) {
          allMessagesLoaded.value = newMessages;

          const totalMessages = allMessagesLoaded.value.length;
          hasMoreMessages.value = totalMessages > (currentPage.value * paginationLimit.value);

        }

        if (hasNewConfirmations && pendingMessageConfirmations.value.size === 0) {
          setLoadingState(false);
          status.value = 'Message delivered!';
        }

      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    pollImmediately();
    pollingInterval = setInterval(pollImmediately, baseDelay);
  };
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const connectToRoom = async () => {
    if (isConnected.value) {
      return;
    }

    try {
      setLoadingState(true, 'Connecting to room...');
      await loadMessageHistory();

      const streamStarted = startMessageStream();

      if (streamStarted) {
        isConnected.value = true;
        status.value = `Connected to room: ${roomId.value} `;
      } else {
        startPolling();
        isConnected.value = true;
        status.value = `Connected to room: ${roomId.value} `;
      }

    } catch (error) {
      startPolling();
      isConnected.value = true;
      status.value = `Connected to room: ${roomId.value} `;
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

  const manualRefresh = async () => {
    try {
      setLoadingState(true, 'Refreshing messages...');
      const historyMessages = await chatService.getMessageHistory(roomId.value, 50);
      const messagesWithUsernames = ensureMessageUsernames(historyMessages);

      allMessagesLoaded.value = messagesWithUsernames.reverse();

      const totalMessages = allMessagesLoaded.value.length;
      hasMoreMessages.value = totalMessages > (currentPage.value * paginationLimit.value);

      status.value = 'Messages refreshed';
    } catch (error) {
      status.value = 'Failed to refresh messages';
    } finally {
      setLoadingState(false);
    }
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
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
      return false;
    }
  };

  const sendMessage = async (messageContent) => {
    if (!canSendMessage.value || !messageContent.trim()) {
      return;
    }

    try {
      setLoadingState(true, 'Sending message...');

      const userId = currentUser.value?.userId || '';
      const username = currentUser.value?.username || '';

      const response = await chatService.sendMessage(userId, username, messageContent, roomId.value);

      pendingMessageConfirmations.value.add(response.messageId);

      updateUserMap(response.userId, 'user_' + response.username);

      status.value = '✅ Message sent! Waiting for it to appear...';

      setTimeout(() => {
        pendingMessageConfirmations.value.delete(response.messageId);
      }, 2000);

      return response;

    } catch (error) {
      handleApiError(error, 'send message');
    } finally {
      setLoadingState(false);
    }
  };

  const startMessageStream = () => {
    try {
      stopMessageStream();

      messageStream = chatService.streamMessages(roomId.value, {
        onMessage: (message) => {
          const messageWithUsername = ensureMessageUsernames([message])[0];

          const isDuplicate = allMessagesLoaded.value.some(
            msg => msg.messageId === messageWithUsername.messageId
          );

          if (!isDuplicate) {
            allMessagesLoaded.value.push(messageWithUsername);

            const totalMessages = allMessagesLoaded.value.length;
            hasMoreMessages.value = totalMessages > (currentPage.value * paginationLimit.value);
          }
        },
        onError: (error) => {
          startPolling();
        },
        onEnd: () => {
          startPolling();
        }
      });

      return true;
    } catch (error) {
      startPolling();
      return false;
    }
  };

  const stopMessageStream = () => {
    if (messageStream) {
      messageStream.cancel();
      messageStream = null;
    }
  };

  const clearMessages = () => {
    messages.value = [];
    allMessagesLoaded.value = [];
    currentPage.value = 1;
    hasMoreMessages.value = false;
  };

  onUnmounted(() => {
    disconnectFromRoom();
  });

  return {
    messages: displayedMessages,
    currentMessage,
    roomId,
    status,
    isLoading,
    isAuthenticated,
    currentUser,
    authError,
    isConnected,
    isSendingMessage,

    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
    currentPage,

    allMessagesLoaded,
    manualRefresh,
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