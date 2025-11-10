<template>
  <div class="message-input-container">
    <div class="input-group">
      <input
        v-model="localMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        :disabled="isLoading || !isConnected"
        class="message-input"
      />
      <button
        @click="sendMessage"
        :disabled="!localMessage.trim() || isLoading || !isConnected"
        class="send-btn"
        :class="{ 'send-btn-loading': isLoading }"
      >
        <span v-if="isLoading" class="loading-content">
          <span class="loading-spinner"></span>
          Sending...
        </span>
        <span v-else class="normal-content">
          Send
        </span>
      </button>
    </div>
    
    <div v-if="isLoading" class="sending-indicator">
      ⏳ Your message is being sent...
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isConnected: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['send-message']);

const localMessage = ref('');

const sendMessage = () => {
  if (localMessage.value.trim() && !props.isLoading && props.isConnected) {
    emit('send-message', localMessage.value.trim());
    localMessage.value = '';
  }
};


</script>

<style scoped>
.message-input-container {
  padding: 20px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 14px 18px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.message-input:focus {
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.message-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn {
  padding: 14px 28px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn-loading {
  background: #ffc107 !important;
  color: #212529 !important;
}

.send-btn-loading:disabled {
  background: #ffc107 !important;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #212529;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.normal-content {
  font-weight: 600;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sending-indicator {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 12px;
  font-style: italic;
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .send-btn {
    width: 100%;
    min-width: auto;
  }
  
  .message-input-container {
    padding: 15px;
  }
}
</style>