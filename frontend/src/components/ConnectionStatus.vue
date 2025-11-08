<template>
  <div class="connection-status" :class="statusClass">
    {{ statusText }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isConnected: {
    type: Boolean,
    required: true
  },
  isConnecting: {
    type: Boolean,
    required: true
  },
  hasError: {
    type: Boolean,
    required: true
  }
});

const statusClass = computed(() => ({
  connected: props.isConnected,
  connecting: props.isConnecting,
  error: props.hasError
}));

const statusText = computed(() => {
  if (props.isConnected) return '🟢 Connected';
  if (props.isConnecting) return '🟡 Connecting...';
  if (props.hasError) return '🔴 Connection Error';
  return '🔴 Disconnected';
});
</script>

<style scoped>
.connection-status {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-radius: 6px;
  margin-bottom: 15px;
}

.connection-status.connected {
  background: #d1edff;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.connection-status.connecting {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.connection-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>