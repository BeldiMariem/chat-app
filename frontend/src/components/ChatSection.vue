<template>
  <div class="chat-section">
    <div class="chat-header">
      <div class="header-content">
        <div class="user-info">
          <div class="user-avatar">
            <img 
              src="/favicon.ico" 
              alt="User Avatar" 
              class="avatar-img"
            />
          </div>
          <div class="user-details">
            <h2 class="welcome-text">Welcome back, <span class="username">{{ username }}</span>!</h2>
            <p class="room-info">Room: <span class="room-name">{{ roomId }}</span></p>
          </div>
        </div>
        <button @click="$emit('logout')" class="logout-btn">
          Logout
        </button>
      </div>

      <div class="connection-controls">
        <div class="room-input-container">
          <div class="input-icon">#</div>
          <input 
            :value="roomId" 
            @input="$emit('update:roomId', $event.target.value)"
            placeholder="Enter room ID" 
            class="room-input" 
            :disabled="isConnected" 
          />
        </div>
        <button 
          @click="$emit('toggleConnection')" 
          class="connect-btn" 
          :class="{ connected: isConnected }"
          :disabled="!roomId.trim()"
        >
          {{ isConnected ? 'Disconnect' : 'Connect' }}
        </button>
      </div>
    </div>

    <div class="status-message" :class="statusClass">
      <div class="status-icon">
        {{ statusClass['status-error'] ? '⚠️' : '💬' }}
      </div>
      <div class="status-text">{{ status }}</div>
    </div>

    <div class="chat-content">
      <MessageList 
        :messages="messages" 
        :current-user-id="currentUser.userId" 
        :is-connected="isConnected"
        :has-more-messages="hasMoreMessages" 
        :is-loading-more="isLoadingMore" 
        :current-page="currentPage"
        :load-more-messages="loadMoreMessages"
      />

      <MessageInput 
        :is-connected="isConnected" 
        :is-loading="false"
        @send-message="$emit('sendMessage', $event)" 
      />
    </div>
  </div>
</template>

<script setup>
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

defineProps({
  username: String,
  roomId: String,
  isConnected: Boolean,
  status: String,
  statusClass: Object,
  messages: Array,
  currentUser: Object,
  hasMoreMessages: Boolean,
  isLoadingMore: Boolean,
  currentPage: Number,
  loadMoreMessages: Function
});

defineEmits([
  'update:roomId',
  'toggleConnection',
  'logout',
  'sendMessage'
]);
</script>

<style scoped>
.chat-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0    ;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 0;
}

.chat-header {
  background: white;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 36px;
  height: 36px;
  filter: brightness(0) invert(1);
}

.user-details {
  flex: 1;
}

.welcome-text {
  margin: 0 0 6px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.username {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.room-info {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

.room-name {
  font-weight: 600;
  color: #667eea;
}

.logout-btn {
  padding: 12px 24px;
  background: #f8f9fa;
  color: #718096;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 0.95rem;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
  transform: translateY(-2px);
}

.connection-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.room-input-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  color: #718096;
  z-index: 1;
}

.room-input {
  width: 100%;
  padding: 14px 16px 14px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  transition: all 0.3s ease;
}

.room-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.room-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.connect-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 0.95rem;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.connect-btn.connected {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.connect-btn.connected:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.connect-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.status-text {
  flex: 1;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (max-width: 1024px) {
  .chat-header {
    padding: 20px 24px;
  }
  

  .user-avatar {
    width: 56px;
    height: 56px;
  }
  
  .avatar-img {
    width: 32px;
    height: 32px;
  }
  
  .welcome-text {
    font-size: 1.15rem;
  }
}

@media (max-width: 768px) {
  .chat-header {
    padding: 16px 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .connection-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .user-info {
    justify-content: center;
    text-align: center;
  }
  
  .chat-content {
    padding: 0 20px 16px;
  }
  
  .status-message {
    padding: 14px 20px;
  }
  
  .user-avatar {
    width: 52px;
    height: 52px;
  }
  
  .avatar-img {
    width: 28px;
    height: 28px;
  }
  
  .logout-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 14px 16px;
  }
  
  .chat-content {
    padding: 0 16px 12px;
  }
  
  .status-message {
    padding: 12px 16px;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
  }
  
  .avatar-img {
    width: 24px;
    height: 24px;
  }
  
  .room-input {
    padding: 12px 12px 12px 36px;
    font-size: 16px;
  }
  
  .connect-btn, .logout-btn {
    padding: 12px 20px;
  }
  
  .welcome-text {
    font-size: 1.1rem;
  }
}
</style>