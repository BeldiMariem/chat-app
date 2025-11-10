<template>
  <form @submit.prevent="handleSubmit" class="register-form">

    <div class="form-content">
      <div class="input-group">
        <div class="input-container">
          <input 
            v-model="username" 
            placeholder="Choose a username" 
            class="auth-input"
            :disabled="isLoading" 
            required
            type="text"
          />
          <div class="input-icon"></div>
        </div>
      </div>

      <div class="input-group">
        <div class="input-container">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Create a password" 
            class="auth-input"
            :disabled="isLoading" 
            required
          />
          <div class="input-icon"></div>
        </div>
      </div>

      <div class="input-group">
        <div class="input-container">
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            class="auth-input"
            :class="{ 'input-error': !passwordsMatch && confirmPassword }"
            :disabled="isLoading" 
            required
          />
          <div class="input-icon"></div>
        </div>
        
        <div v-if="!passwordsMatch && confirmPassword" class="password-error">
          <div class="error-icon">⚠️</div>
          <span>Passwords do not match</span>
        </div>

        <div v-else-if="passwordsMatch && confirmPassword" class="password-success">
          <div class="success-icon">✓</div>
          <span>Passwords match</span>
        </div>
      </div>

      <div class="password-strength" v-if="password">
        <div class="strength-bar" :class="strengthClass"></div>
        <div class="strength-text">{{ strengthText }}</div>
      </div>

      <button 
        type="submit" 
        :disabled="!canSubmit || isLoading" 
        class="auth-btn register-btn"
        :class="{ loading: isLoading }"
      >
        <span v-if="!isLoading" class="btn-content">
          <span class="btn-icon"></span>
          Create Account
        </span>
        <span v-else class="btn-content">
          <span class="loading-spinner"></span>
          Creating Account...
        </span>
      </button>
    </div>


  </form>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const passwordStrength = computed(() => {
  if (!password.value) return 0;
  
  let strength = 0;
  if (password.value.length >= 8) strength += 1;
  if (/[A-Z]/.test(password.value)) strength += 1;
  if (/[a-z]/.test(password.value)) strength += 1;
  if (/[0-9]/.test(password.value)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 1;
  
  return strength;
});

const strengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'fair';
  if (strength <= 4) return 'good';
  return 'strong';
});

const strengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return 'Weak password';
  if (strength <= 3) return 'Fair password';
  if (strength <= 4) return 'Good password';
  return 'Strong password';
});

const canSubmit = computed(() => {
  return username.value.trim() && 
         password.value.trim() && 
         confirmPassword.value.trim() && 
         passwordsMatch.value &&
         passwordStrength.value >= 2; 
});

const handleSubmit = () => {
  if (canSubmit.value && !props.isLoading) {
    emit('submit', {
      username: username.value.trim(),
      password: password.value.trim()
    });
  }
};

defineExpose({
  reset: () => {
    username.value = '';
    password.value = '';
    confirmPassword.value = '';
  }
});
</script>

<style scoped>
.register-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.form-subtitle {
  color: #718096;
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.form-content {
  space-y: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input {
  width: 100%;
  padding: 16px 16px 16px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  color: #2d3748;
}

.auth-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.auth-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.auth-input.input-error {
  border-color: #fc8181;
  box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.1);
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  pointer-events: none;
  transition: transform 0.2s ease;
}

.auth-input:focus + .input-icon {
  transform: scale(1.1);
}

.password-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

.password-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 13px;
  font-weight: 500;
}

.error-icon, .success-icon {
  font-size: 14px;
}

.password-strength {
  margin: 20px 0;
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  background: #e2e8f0;
}

.strength-bar.weak {
  background: linear-gradient(90deg, #ef4444 0%, #e2e8f0 100%);
  width: 25%;
}

.strength-bar.fair {
  background: linear-gradient(90deg, #f59e0b 0%, #e2e8f0 100%);
  width: 50%;
}

.strength-bar.good {
  background: linear-gradient(90deg, #10b981 0%, #e2e8f0 100%);
  width: 75%;
}

.strength-bar.strong {
  background: #10b981;
  width: 100%;
}

.strength-text {
  font-size: 12px;
  color: #718096;
  text-align: center;
  font-weight: 500;
}

.register-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-btn.loading {
  pointer-events: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 18px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.security-note {
  color: #a0aec0;
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-title {
    font-size: 20px;
  }
  
  .auth-input {
    padding: 14px 14px 14px 45px;
    font-size: 16px;
  }
  
  .input-icon {
    left: 14px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-title {
    color: white;
  }
  
  .form-subtitle {
    color: #a0aec0;
  }
  
  .auth-input {
    background: #2d3748;
    border-color: #4a5568;
    color: white;
  }
  
  .auth-input:focus {
    border-color: #667eea;
  }
  
  .auth-input:disabled {
    background: #4a5568;
  }
  
  .password-error {
    background: #2d1a1a;
    border-color: #742a2a;
    color: #fc8181;
  }
  
  .password-success {
    background: #1a2a1a;
    border-color: #2a742a;
    color: #68d391;
  }
  
  .strength-bar {
    background: #4a5568;
  }
  
  .security-note {
    color: #718096;
  }
}
</style>