<template>
  <div class="chat-app">
    <header class="chat-header">
      <h1>💬 Real-Time Chat (gRPC)</h1>
      <p class="chat-subtitle">Clean Architecture Implementation</p>
    </header>

    <main class="chat-main">
      <ConnectionStatus
        :is-connected="isConnected"
        :is-connecting="isConnecting"
        :has-error="hasError"
      />

      <UserInfo
        v-model:userId="userId"
        v-model:roomId="roomId"
        :is-connected="isConnected"
        :is-loading="isLoading"
        @toggle-connection="toggleConnection"
        @load-history="handleLoadHistory"
      />

      <div class="status-message" :class="statusClass">
        {{ status }}
      </div>

      <MessageList
        :messages="messages"
        :current-user-id="userId"
        :is-connected="isConnected"
      />

      <MessageInput
        :is-connected="isConnected"
        :user-id="userId"
        :is-loading="isLoading"
        @send-message="handleSendMessage"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { useGrpcClient } from '../composables/useGrpcClient.js';
import { useChat } from '../composables/useChat.js';

import ConnectionStatus from './ConnectionStatus.vue';
import UserInfo from './UserInfo.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

const {
  isConnected,
  isConnecting,
  hasError,
  connect: connectGrpc,
  disconnect: disconnectGrpc
} = useGrpcClient();

const {
  messages,
  userId,
  roomId,
  status: chatStatus,
  isLoading,
  sendMessage,
  loadMessageHistory,
  startMessageStream,
  stopMessageStream
} = useChat();

const connectionError = ref(null);

const status = computed(() => {
  return connectionError.value || chatStatus.value;
});

const statusClass = computed(() => ({
  'status-info': !connectionError.value,
  'status-error': connectionError.value
}));

const toggleConnection = async () => {
  if (isConnected.value) {
    await disconnect();
  } else {
    await connect();
  }
};

const connect = async () => {
  try {
    connectionError.value = null;
    
    await connectGrpc();
    
    startMessageStream();
    
    await loadMessageHistory();
    
  } catch (error) {
    connectionError.value = `Connection failed: ${error.message}`;
    console.error('Connection error:', error);
    await disconnect();
  }
};

const disconnect = async () => {
  stopMessageStream();
  disconnectGrpc();
  connectionError.value = null;
};

const handleSendMessage = async (messageContent) => {
  try {
    await sendMessage(messageContent);
  } catch (error) {
    console.error('Send message error:', error);
  }
};

const handleLoadHistory = async () => {
  try {
    await loadMessageHistory();
  } catch (error) {
    console.error('Load history error:', error);
  }
};

onUnmounted(() => {
  disconnect();
});
</script>

<style scoped>
.chat-app {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 90vh;
}

.chat-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px 20px;
  text-align: center;
}

.chat-header h1 {
  margin: 0 0 8px 0;
  font-size: 1.8em;
  font-weight: 600;
}

.chat-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

.chat-main {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.status-message {
  padding: 10px 15px;
  text-align: center;
  font-size: 0.9em;
  margin: 0 15px;
  border-radius: 6px;
}

.status-info {
  background: #e7f3ff;
  color: #0066cc;
  border: 1px solid #b3d9ff;
}

.status-error {
  background: #ffe6e6;
  color: #cc0000;
  border: 1px solid #ffb3b3;
}
</style>