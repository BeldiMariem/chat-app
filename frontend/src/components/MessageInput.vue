<template>
  <div class="message-input-container">
    <form @submit.prevent="handleSubmit" class="message-form">
      <div class="input-wrapper">
        <input
          v-model="message"
          type="text"
          placeholder="Type your message..."
          class="message-input"
          :disabled="!isConnected || isLoading"
          maxlength="500"
        />
        <div class="input-actions">
          <div class="char-count" :class="{ warning: message.length > 400 }">
            {{ message.length }}/500
          </div>
          <button
            type="submit"
            class="send-btn"
            :disabled="!canSend || !isConnected || isLoading"
            :class="{ connected: isConnected }"
          >
            <span class="send-icon">{{ isLoading ? '⏳' : '' }}</span>
            <span class="send-text">{{ isLoading ? 'Sending...' : 'Send' }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  isConnected: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['sendMessage']);

const message = ref('');

const canSend = computed(() => {
  return message.value.trim().length > 0;
});

const handleSubmit = () => {
  if (canSend.value && props.isConnected && !props.isLoading) {
    emit('sendMessage', message.value.trim());
    message.value = '';
  }
};

watch(() => props.isConnected, (connected) => {
  if (connected) {
    nextTick(() => {
      const input = document.querySelector('.message-input');
      input?.focus();
    });
  }
});
</script>

<style scoped>
.message-input-container {
  padding: 20px 0 0;
  background: white;
}

.message-form {
  width: 100%;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.message-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  resize: none;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.message-input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.message-input::placeholder {
  color: #94a3b8;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.char-count.warning {
  color: #f59e0b;
  font-weight: 600;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #9ca3af;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-btn.connected {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn:disabled {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.send-icon {
  font-size: 16px;
}

.send-text {
  font-size: 14px;
}

.send-btn:disabled .send-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 16px 0 0;
  }
  
  .input-wrapper {
    padding: 12px;
    border-radius: 12px;
  }
  
  .message-input {
    padding: 14px 16px;
    font-size: 16px;
  }
  
  .send-btn {
    padding: 10px 20px;
  }
  
  .send-text {
    display: none;
  }
  
  .send-btn {
    padding: 10px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .message-input-container {
    background: #1a202c;
  }
  
  .input-wrapper {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .message-input {
    background: #2d3748;
    border-color: #4a5568;
    color: white;
  }
  
  .message-input:focus {
    border-color: #667eea;
  }
  
  .message-input:disabled {
    background: #4a5568;
  }
  
  .char-count {
    color: #a0aec0;
  }
}
</style>