<template>
  <div class="user-info">
    <div class="input-group">
      <label for="userId">Username:</label>
      <input
        id="userId"
        v-model="localUserId"
        placeholder="Enter your username"
        class="user-input"
        :disabled="isConnected"
      />
    </div>

    <div class="input-group">
      <label for="roomId">Room ID:</label>
      <input
        id="roomId"
        v-model="localRoomId"
        placeholder="Enter room ID"
        class="room-input"
        :disabled="isConnected"
      />
    </div>

    <div class="button-group">
      <button
        @click="toggleConnection"
        class="connect-btn"
        :disabled="!connectionParamsValid && !isConnected"
      >
        {{ isConnected ? 'Disconnect' : 'Connect' }}
      </button>
      
      <button
        @click="loadHistory"
        class="history-btn"
        :disabled="!isConnected || isLoading"
      >
        📚 Load History
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:userId',
  'update:roomId',
  'toggle-connection',
  'load-history'
]);

const localUserId = ref(props.userId);
const localRoomId = ref(props.roomId);

watch(localUserId, (newValue) => {
  emit('update:userId', newValue);
});

watch(localRoomId, (newValue) => {
  emit('update:roomId', newValue);
});

watch(() => props.userId, (newValue) => {
  localUserId.value = newValue;
});

watch(() => props.roomId, (newValue) => {
  localRoomId.value = newValue;
});

const connectionParamsValid = computed(() => {
  return localUserId.value.trim() && localRoomId.value.trim();
});

const toggleConnection = () => {
  emit('toggle-connection');
};

const loadHistory = () => {
  emit('load-history');
};
</script>

<style scoped>
.user-info {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 15px;
  align-items: end;
}

.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-group label {
  font-size: 0.9em;
  font-weight: 500;
  margin-bottom: 5px;
  color: #495057;
}

.user-input,
.room-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.user-input:focus,
.room-input:focus {
  outline: none;
  border-color: #007bff;
}

.user-input:disabled,
.room-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-group {
  display: flex;
  gap: 10px;
}

.connect-btn {
  padding: 10px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
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
  white-space: nowrap;
}

.history-btn:hover:not(:disabled) {
  background: #218838;
}

.history-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>