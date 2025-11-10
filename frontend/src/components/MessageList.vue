<template>
  <div class="messages-container">
    <div v-if="hasMoreMessages" class="load-more-container">
      <button 
        type="text"
        @click="loadMoreMessages" 
        :disabled="isLoadingMore"
        class="load-more-btn"
      >
        {{ isLoadingMore ? 'Loading...' : `Load earlier messages (${currentPage * 5}+)` }}
      </button>
    </div>

    <div class="messages" ref="messagesContainer">
      <div v-if="messages.length === 0 && !isConnected" class="no-messages">
        Disconnected. Connect to join the chat.
      </div>
      
      <div v-else-if="messages.length === 0 && isConnected" class="no-messages">
        No messages yet. Start the conversation!
      </div>

      <div
        v-for="message in messages"
        :key="message.messageId"
        class="message"
        :class="{ 'own-message': message.userId === currentUserId }"
      >
        <div class="message-header">
          <strong>{{ message.username }}</strong>
          <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
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
  height: 100%;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.load-more-btn {
  color: #007bff;
  background: #f8f9fa;
  border: none;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
}

.load-more-btn:hover:not(:disabled) {
  background: #0056b3;
  color: white;
  transform: translateY(-1px);
}

.load-more-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 0 15px 15px 15px;
  scroll-behavior: smooth;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.message {
  margin-bottom: 15px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  animation: fadeIn 0.3s ease-in;
}

.own-message {
  background: #007bff;
  color: white;
  margin-left: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.timestamp {
  font-size: 0.8em;
  opacity: 0.8;
}

.own-message .timestamp {
  opacity: 0.9;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.4;
}

.no-messages {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-style: italic;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>