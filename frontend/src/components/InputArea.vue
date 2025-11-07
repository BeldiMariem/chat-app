<template>
  <div class="input-area">
    <input 
      :value="message"
      @input="$emit('update:message', $event.target.value)"
      @keyup.enter="sendMessage"
      placeholder="Type your message..."
      :disabled="!connected || !userId"
      class="message-input"
    />
    <button 
      @click="sendMessage"
      :disabled="!canSend"
      class="send-btn"
    >
      Send
    </button>
  </div>
</template>

<script>
export default {
  name: 'InputArea',
  props: {
    message: String,
    connected: Boolean,
    userId: String
  },
  emits: ['update:message', 'send-message'],
  computed: {
    canSend() {
      return this.message.trim() && this.connected && this.userId;
    }
  },
  methods: {
    sendMessage() {
      if (this.canSend) {
        this.$emit('send-message');
      }
    }
  }
}
</script>

<style scoped>
.input-area {
  padding: 15px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.message-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>