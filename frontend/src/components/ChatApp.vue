<template>
  <div class="chat-app">
    <header class="chat-header">
      <h1>💬 Real-Time Chat App</h1>
    </header>

    <main class="chat-main">
      <div v-if="isCheckingAuth" class="loading-auth-section">
        <div class="loading-auth">
          <h3>Checking authentication...</h3>
          <p>Please wait while we verify your session.</p>
        </div>
      </div>

      <AuthSection
        v-else-if="!isAuthenticated"
        :is-loading="isLoading"
        :auth-error="authError"
        @login="handleLogin"
        @register="handleRegister"
      />

      <ChatSection
        v-else
        :username="username"
        :room-id="roomId"
        :is-connected="isConnected"
        :status="status"
        :status-class="statusClass"
        :messages="messages"
        :current-user="currentUser"
        :has-more-messages="hasMoreMessages"
        :is-loading-more="isLoadingMore"
        :current-page="currentPage"
        :load-more-messages="loadMoreMessages" 
        @update:roomId="roomId = $event"
        @toggle-connection="toggleConnection"
        @logout="handleLogout"
        @send-message="handleSendMessage"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useChat } from '../composables/useChat.js';
import AuthSection from './AuthSection.vue';
import ChatSection from './ChatSection.vue';

const {
  messages,
  roomId,
  status,
  isLoading,
  isAuthenticated,
  currentUser,
  authError,
  isConnected,
  loadMoreMessages,  
  hasMoreMessages,
  isLoadingMore,
  currentPage,
  register,
  login,
  logout,
  checkAuthentication,
  sendMessage,
  toggleRoomConnection
} = useChat();

const isCheckingAuth = ref(true);

const username = computed(() => currentUser.value?.username || 'User');

const statusClass = computed(() => ({
  'status-info': !authError.value,
  'status-error': !!authError.value
}));

const handleLogin = async (credentials) => {
  try {
    await login(credentials.username, credentials.password);
  } catch (error) {
    console.error('Login error:', error);
  }
};

const handleRegister = async (credentials) => {
  try {
    await register(credentials.username, credentials.password);
  } catch (error) {
    console.error('Registration error:', error);
  }
};

const handleLogout = () => {
  localStorage.removeItem('chat_token');
  localStorage.removeItem('chat_user');
  logout();
};

const handleSendMessage = async (messageContent) => {
  try {
    await sendMessage(messageContent);
  } catch (error) {
    console.error('Send message error:', error);
  }
};

const toggleConnection = async () => {
  try {
    await toggleRoomConnection();
  } catch (error) {
    console.error('Connection toggle error:', error);
  }
};

onMounted(async () => {
  try {
    const isAuthValid = await checkAuthentication();
    isCheckingAuth.value = false;

    if (isAuthValid && roomId.value.trim()) {
      await toggleRoomConnection();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    isCheckingAuth.value = false;
  }
});
</script>

<style scoped>
.chat-app {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 100vh;
  height: 100vh;
}

.chat-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.loading-auth-section {
  padding: 40px 20px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.loading-auth {
  text-align: center;
  color: #6c757d;
  max-width: 400px;
}

.loading-auth h3 {
  margin-bottom: 10px;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .chat-app {
    border-radius: 0;
    height: 100vh;
    min-height: 100vh;
  }
  
  .chat-header {
    padding: 16px 20px;
  }
  
  .chat-main {
    height: calc(100vh - 72px);
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-main {
    height: calc(100vh - 64px);
  }
}
</style>