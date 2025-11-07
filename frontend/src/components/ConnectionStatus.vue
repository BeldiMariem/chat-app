<template>
  <div class="connection-status" :class="{ connected }">
    {{ connected ? '🟢 Connected' : '🔴 Disconnected' }}
  </div>
</template>

<script>
export default {
  name: 'ConnectionStatus',
  props: {
    connected: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.connection-status {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  background: #f8d7da;
  color: #721c24;
}

.connection-status.connected {
  background: #d1edff;
  color: #0c5460;
}
</style>