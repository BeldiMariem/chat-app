<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="icon-container">
          <img 
            src="/favicon.ico" 
            class="user-icon"
          />
        </div>
        <h1 class="auth-title">Welcome to Chat</h1>
        <p class="auth-subtitle">Sign in to start chatting</p>
      </div>

      <AuthTabs v-model="authMode" />

      <div class="auth-form">
        <LoginForm
          v-if="authMode === 'login'"
          :is-loading="isLoading"
          @submit="handleLogin"
        />
        <RegisterForm
          v-else
          :is-loading="isLoading"
          @submit="handleRegister"
        />
        
        <div v-if="authError" class="auth-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">{{ authError }}</div>
        </div>
      </div>

      <div class="auth-footer">
        <p v-if="authMode === 'login'" class="switch-text">
          Don't have an account? 
          <button class="switch-btn" @click="authMode = 'register'">Sign up</button>
        </p>
        <p v-else class="switch-text">
          Already have an account? 
          <button class="switch-btn" @click="authMode = 'login'">Sign in</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AuthTabs from './AuthTabs.vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  authError: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['login', 'register']);

const authMode = ref('login');

const handleLogin = (credentials) => {
  emit('login', credentials);
};

const handleRegister = (credentials) => {
  emit('register', credentials);
};
</script>

<style scoped>
.auth-container {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.user-icon {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  color: #718096;
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

.auth-form {
  margin: 30px 0;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
  animation: shake 0.5s ease-in-out;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  line-height: 1.4;
}

.auth-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.switch-text {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.switch-btn {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.switch-btn:hover {
  color: #5a67d8;
  background: #f7fafc;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 20px 15px;
  }
  
  .auth-card {
    padding: 30px 25px;
    border-radius: 16px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .icon-container {
    width: 70px;
    height: 70px;
  }
  
  .user-icon {
    width: 35px;
    height: 35px;
  }
}

.auth-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  .auth-card {
    background: #1a202c;
    color: white;
  }
  
  .auth-title {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .auth-subtitle {
    color: #a0aec0;
  }
  
  .auth-error {
    background: #2d1a1a;
    border-color: #742a2a;
    color: #fc8181;
  }
  
  .switch-text {
    color: #a0aec0;
  }
  
  .switch-btn:hover {
    background: #2d3748;
  }
}
</style>