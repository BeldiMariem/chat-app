<template>
    <div class="chat-app">
        <header class="chat-header">
            <h1>💬 Real-Time Chat (gRPC)</h1>
            <p class="chat-subtitle">Secure Authentication</p>
        </header>

        <main class="chat-main">
            <ConnectionStatus :is-connected="isConnected" :is-connecting="isLoading" :has-error="!!authError" />

            <div v-if="isCheckingAuth" class="auth-section">
                <div class="loading-auth">
                    <h3>Checking authentication...</h3>
                    <p>Please wait while we verify your session.</p>
                </div>
            </div>

            <div v-else-if="!isAuthenticated" class="auth-section">
                <div class="auth-tabs">
                    <button @click="authMode = 'login'" :class="{ active: authMode === 'login' }" class="auth-tab">
                        Login
                    </button>
                    <button @click="authMode = 'register'" :class="{ active: authMode === 'register' }"
                        class="auth-tab">
                        Register
                    </button>
                </div>

                <div class="auth-form">
                    <div v-if="authMode === 'login'" class="login-form">
                        <h3>Login to Chat</h3>
                        <input v-model="loginUsername" placeholder="Username" class="auth-input"
                            :disabled="isLoading" />
                        <input v-model="loginPassword" type="password" placeholder="Password" class="auth-input"
                            :disabled="isLoading" />
                        <button @click="handleLogin" :disabled="!canLogin || isLoading" class="auth-btn">
                            {{ isLoading ? 'Logging in...' : 'Login' }}
                        </button>
                    </div>

                    <div v-else class="register-form">
                        <h3>Create Account</h3>
                        <input v-model="registerUsername" placeholder="Username" class="auth-input"
                            :disabled="isLoading" />
                        <input v-model="registerPassword" type="password" placeholder="Password" class="auth-input"
                            :disabled="isLoading" />
                        <input v-model="registerConfirmPassword" type="password" placeholder="Confirm Password"
                            class="auth-input" :disabled="isLoading" />
                        <button @click="handleRegister" :disabled="!canRegister || isLoading" class="auth-btn">
                            {{ isLoading ? 'Registering...' : 'Register' }}
                        </button>
                    </div>

                    <div v-if="authError" class="auth-error">
                        {{ authError }}
                    </div>
                </div>
            </div>

            <div v-else class="chat-section">
                <div class="user-info">
                    <div class="user-welcome">
                        Welcome, <strong>{{ username }}</strong>!
                        <button @click="handleLogout" class="logout-btn">Logout</button>

                    </div>

                    <div class="room-selection">
                        <input v-model="roomId" placeholder="Room ID" class="room-input" :disabled="isConnected" />
                        <button @click="toggleConnection" class="connect-btn" :disabled="!roomId.trim()">
                            {{ isConnected ? 'Disconnect' : 'Connect' }}
                        </button>
                        <button @click="loadMessageHistory" class="history-btn" :disabled="!isConnected">
                            📚 Load History
                        </button>
                    </div>
                </div>

                <div class="status-message" :class="statusClass">
                    {{ status }}
                </div>

                <MessageList :messages="messages" :current-user-id="currentUserId" :is-connected="isConnected" />

                <MessageInput :is-connected="isConnected" :is-loading="isLoading" @send-message="handleSendMessage" />
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useChat } from '../composables/useChat.js';

import ConnectionStatus from './ConnectionStatus.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

const authMode = ref('login');
const loginUsername = ref('');
const loginPassword = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const isCheckingAuth = ref(true); 

const {
  messages,
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
  toggleRoomConnection
} = useChat();

const username = computed(() => currentUser.value?.username || 'User');
const currentUserId = computed(() => currentUser.value?.userId || '');

const canLogin = computed(() => {
    return loginUsername.value.trim() && loginPassword.value.trim();
});

const canRegister = computed(() => {
    return (
        registerUsername.value.trim() &&
        registerPassword.value.trim() &&
        registerConfirmPassword.value.trim() &&
        registerPassword.value === registerConfirmPassword.value
    );
});

const statusClass = computed(() => ({
    'status-info': !authError.value,
    'status-error': !!authError.value
}));

const handleLogin = async () => {
    try {
        await login(loginUsername.value, loginPassword.value);
        loginUsername.value = '';
        loginPassword.value = '';
    } catch (error) {
        console.error('Login error:', error);
    }
};

const handleRegister = async () => {
    try {
        await register(registerUsername.value, registerPassword.value);
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
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

onUnmounted(() => {
});
</script>

<style scoped>
.chat-app {
    width: 800px;
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
    display: flex;
    flex-direction: column;
    min-height: 600px;
}

.auth-section {
    padding: 30px 20px;
    background: #f8f9fa;
}

.auth-tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #e9ecef;
}

.auth-tab {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: #6c757d;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.auth-tab.active {
    color: #007bff;
    border-bottom-color: #007bff;
}

.auth-form {
    max-width: 400px;
    margin: 0 auto;
}

.auth-form h3 {
    margin-bottom: 20px;
    text-align: center;
    color: #333;
}

.auth-input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    transition: border-color 0.2s;
}

.auth-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.auth-input:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
}

.auth-btn {
    width: 100%;
    padding: 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.auth-btn:hover:not(:disabled) {
    background: #0056b3;
}

.auth-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.auth-error {
    margin-top: 15px;
    padding: 10px;
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
}

.chat-section {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.user-info {
    padding: 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.user-welcome {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 1.1em;
}

.logout-btn {
    padding: 6px 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
}

.logout-btn:hover {
    background: #c82333;
}

.room-selection {
    display: flex;
    gap: 10px;
    align-items: center;
}

.room-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

.room-input:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
}

.connect-btn {
    padding: 10px 16px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.connect-btn:hover:not(:disabled) {
    background: #138496;
}

.connect-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.history-btn {
    padding: 10px 16px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.history-btn:hover:not(:disabled) {
    background: #218838;
}

.history-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
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