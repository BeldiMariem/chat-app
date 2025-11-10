<template>
  <div class="messages-container">
    <div v-if="hasMoreMessages" class="load-more-container">
      <button 
        @click="loadMoreMessages" 
        :disabled="isLoadingMore"
        class="load-more-btn"
        :class="{ loading: isLoadingMore }"
      >
        <span v-if="!isLoadingMore" class="btn-content">
          Load earlier messages
        </span>
        <span v-else class="btn-content">
          <span class="loading-spinner"></span>
          Loading messages...
        </span>
      </button>
    </div>

    <div class="messages" ref="messagesContainer">
      <div v-if="messages.length === 0 && !isConnected" class="empty-state">
        <div class="empty-icon">🚫</div>
        <h3>Disconnected</h3>
        <p>Connect to a room to start chatting</p>
      </div>
      
      <div v-else-if="messages.length === 0 && isConnected" class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>No messages yet</h3>
        <p>Start the conversation!</p>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="message.messageId"
        class="message"
        :class="{ 
          'own-message': message.userId === currentUserId,
          'first-in-group': isFirstInGroup(message, index)
        }"
      >
        <div class="message-avatar">
          {{ getAvatarEmoji(message.username) }}
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="username">{{ message.username }}</span>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </div>
          <div class="message-bubble">
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    required: true
  },
  hasMoreMessages: {
    type: Boolean,
    required: true
  },
  isLoadingMore: {
    type: Boolean,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  loadMoreMessages: {
    type: Function,
    required: true
  }
});

const messagesContainer = ref(null);
const isUserScrolledUp = ref(false);

const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === '0001-01-01T00:00:00Z') {
    return 'Just now';
  }
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Just now';
  }
};

const getAvatarEmoji = (username) => {
  const emojis = ['😊', '😎', '🤠', '👻', '🐱', '🐶', '🦊', '🐼', '🐯', '🦁'];
  const index = username.length % emojis.length;
  return emojis[index];
};

const isFirstInGroup = (message, index) => {
  if (index === 0) return true;
  const prevMessage = props.messages[index - 1];
  return prevMessage.userId !== message.userId;
};

const checkUserScrollPosition = () => {
  if (!messagesContainer.value) return false;
  
  const container = messagesContainer.value;
  const threshold = 100; 
  return container.scrollTop + container.clientHeight < container.scrollHeight - threshold;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value && !isUserScrolledUp.value) {
      const container = messagesContainer.value;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
};

const handleScroll = () => {
  isUserScrolledUp.value = checkUserScrollPosition();
};

watch(
  () => props.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const newMessagesCount = newLength - oldLength;
      
      if (newMessagesCount > 0 && !props.isLoadingMore) {
        scrollToBottom();
      }
    }
  },
  { flush: 'post' }
);

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll);
    scrollToBottom();
  }
});

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
});

defineExpose({
  scrollToBottom
});
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 0;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.load-more-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.load-more-btn.loading {
  pointer-events: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
  scroll-behavior: smooth;
  min-height: 0;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  height: 100%;
}

.empty-icon {
  font-size: clamp(2rem, 8vw, 3rem);
  margin-bottom: 12px;
  opacity: 0.7;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: clamp(1rem, 4vw, 1.125rem);
  font-weight: 600;
  color: #475569;
}

.empty-state p {
  margin: 0;
  font-size: clamp(0.75rem, 3vw, 0.875rem);
}

.message {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  animation: messageSlide 0.3s ease-out;
}

.message.first-in-group {
  margin-top: 12px;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: auto;
}

.own-message {
  flex-direction: row-reverse;
}

.own-message .message-content {
  align-items: flex-end;
}

.own-message .message-avatar {
  background: linear-gradient(135deg, #10b981, #059669);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 85%;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  flex-wrap: wrap;
}

.own-message .message-header {
  flex-direction: row-reverse;
}

.username {
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.timestamp {
  font-size: 10px;
  opacity: 0.7;
  white-space: nowrap;
}

.message-bubble {
  padding: 10px 14px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  line-height: 1.4;
  word-wrap: break-word;
  border: 1px solid #f1f5f9;
  font-size: clamp(0.875rem, 2vw, 1rem);
  word-break: break-word;
  overflow-wrap: break-word;
}

.own-message .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .messages {
    padding: 12px;
  }
  
  .load-more-container {
    padding: 10px 12px;
  }
  
  .load-more-btn {
    padding: 8px 12px;
  }
  
  .message {
    gap: 6px;
  }
  
  .message-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .message-bubble {
    padding: 8px 12px;
    border-radius: 14px;
  }
  
  .username {
    max-width: 80px;
  }
}

@media (max-width: 480px) {
  .messages {
    padding: 8px;
  }
  
  .message {
    gap: 4px;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  
  .message-content {
    max-width: 95%;
  }
  
  .message-bubble {
    padding: 6px 10px;
    border-radius: 12px;
  }
  
  .username {
    max-width: 60px;
    font-size: 10px;
  }
  
  .timestamp {
    font-size: 9px;
  }
  
  .empty-state {
    padding: 30px 16px;
  }
}

@media (max-height: 600px) {
  .empty-state {
    padding: 20px 16px;
  }
  
  .empty-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
  }
}
</style>