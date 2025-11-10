<template>
  <div class="auth-tabs">
    <button
      class="tab"
      :class="{ active: modelValue === 'login' }"
      @click="$emit('update:modelValue', 'login')"
    >
      Sign In
    </button>
    <button
      class="tab"
      :class="{ active: modelValue === 'register' }"
      @click="$emit('update:modelValue', 'register')"
    >
      Sign Up
    </button>
    <div class="tab-indicator" :class="modelValue"></div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'login'
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.auth-tabs {
  display: flex;
  position: relative;
  background: #f7fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 10px;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #718096;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  z-index: 1;
}

.tab.active {
  color: #667eea;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  width: calc(50% - 8px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.tab-indicator.login {
  transform: translateX(4px);
}

.tab-indicator.register {
  transform: translateX(calc(100% + 4px));
}
</style>