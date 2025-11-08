<template>
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
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

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
  }
});

const messagesContainer = ref(null);

const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === '0001-01-01T00:00:00Z') {
    return 'Just now';
  }
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Just now';
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  },
  { flush: 'post' }
);

defineExpose({
  scrollToBottom
});
</script>


<style scoped>
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 0 15px 15px 15px;
}

.message {
  margin-bottom: 15px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 80%;
}

.own-message {
  background: #007bff;
  color: white;
  margin-left: auto;
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
}


</style>