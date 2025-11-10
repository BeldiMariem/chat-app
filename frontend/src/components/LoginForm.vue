<template>
  <form @submit.prevent="handleSubmit" class="auth-form-content">
    <div class="form-group">
      <label for="username" class="form-label">Username</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        class="form-input"
        placeholder="Enter your username"
        required
        :disabled="isLoading"
      />
    </div>
    
    <div class="form-group">
      <label for="password" class="form-label">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        class="form-input"
        placeholder="Enter your password"
        required
        :disabled="isLoading"
      />
    </div>
    
    <button 
      type="submit" 
      class="submit-btn"
      :disabled="isLoading"
      :class="{ loading: isLoading }"
    >
      <span v-if="!isLoading">Sign In</span>
      <span v-else class="loading-text">Signing In...</span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const form = ref({
  username: '',
  password: ''
});

const handleSubmit = () => {
  emit('submit', { ...form.value });
};
</script>

<style scoped>
.auth-form-content {
  space-y: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  position: relative;
  overflow: hidden;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.loading-text::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>