<template>
  <div class="input-area">
    <input
      v-model="message"
      @keyup.enter="sendMessage"
      placeholder="Type your message..."
      :disabled="!isConnected || isLoading"
      class="message-input"
    />
    <button
      @click="sendMessage"
      :disabled="!canSend || isLoading"
      class="send-btn"
    >
      <span v-if="isLoading">⏳</span>
      <span v-else>Send</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isConnected: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send-message']);

const message = ref('');

const canSend = computed(() => {
  return message.value.trim() && props.isConnected && !props.isLoading;
});

const sendMessage = () => {
  if (!canSend.value) return;

  const messageContent = message.value.trim();
  emit('send-message', messageContent);
  message.value = '';
};

defineExpose({
  clearMessage: () => {
    message.value = '';
  }
});
</script>

<style scoped>
.input-area {
  padding: 15px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.6;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 80px;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>