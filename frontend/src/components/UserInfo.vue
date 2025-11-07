<template>
  <div class="user-info">
    <input 
      :value="userId"
      @input="$emit('update:userId', $event.target.value)"
      placeholder="Enter your username" 
      class="user-input"
    />
    <input 
      :value="roomId"
      @input="$emit('update:roomId', $event.target.value)"
      placeholder="Enter room ID" 
      class="room-input"
    />
    <button @click="$emit('toggle-connection')" class="connect-btn">
      {{ connected ? 'Disconnect' : 'Connect' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
  props: {
    userId: String,
    roomId: String,
    connected: Boolean
  },
  emits: ['update:userId', 'update:roomId', 'toggle-connection']
}
</script>

<style scoped>
.user-info {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-input, .room-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
}

.connect-btn {
  padding: 10px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.connect-btn:hover {
  background: #138496;
}
</style>