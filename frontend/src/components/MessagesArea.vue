<template>
  <div class="messages" ref="messagesContainer">
    <div 
      v-for="message in messages" 
      :key="message.messageId" 
      class="message"
      :class="{ 'own-message': message.userId === currentUserId }"
    >
      <div class="message-header">
        <strong>{{ message.userId }}</strong>
        <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
      </div>
      <div class="message-content">{{ message.content }}</div>
    </div>
    
    <div v-if="messages.length === 0 && connected" class="no-messages">
      No messages yet. Start the conversation!
    </div>
    
    <div v-else-if="!connected" class="no-messages">
      Disconnected. Click "Connect" to join the chat.
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessagesArea',
  props: {
    messages: {
      type: Array,
      required: true
    },
    currentUserId: String,
    connected: Boolean
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } catch (e) {
        return timestamp;
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
}
</script>

<style scoped>
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
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
}

.no-messages {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-style: italic;
}
</style>