<template>
  <div class="chat-app">
    <h1>💬 Real-Time Chat (gRPC)</h1>

    <div class="chat-container">
      <div class="connection-status" :class="{ connected: isConnected }">
        {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
      </div>

      <div class="user-info">
        <input v-model="userId" placeholder="Enter your username" class="user-input" />
        <input v-model="roomId" placeholder="Enter room ID" class="room-input" />
        <button @click="toggleConnection" class="connect-btn">
          {{ isConnected ? 'Disconnect' : 'Connect' }}
        </button>
        <button @click="loadMessageHistory" class="history-btn" :disabled="!isConnected">
          📚 Load History
        </button>
      </div>

      <div class="status">{{ status }}</div>

      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.messageId" class="message"
          :class="{ 'own-message': message.userId === userId }">
          <div class="message-header">
            <strong>{{ message.userId }}</strong>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>

        <div v-if="messages.length === 0 && isConnected" class="no-messages">
          No messages yet. Start the conversation!
        </div>

        <div v-else-if="!isConnected" class="no-messages">
          Disconnected. Click "Connect" to join the chat.
        </div>
      </div>

      <div class="input-area">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."
          :disabled="!isConnected || !userId" class="message-input" />
        <button @click="sendMessage" :disabled="!newMessage.trim() || !isConnected || !userId" class="send-btn">
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { client, createHistoryRequest, createMessageRequest, createStreamRequest } from './proto/client.js';

export default {
  name: 'ChatApp',
  data() {
    return {
      messages: [],
      newMessage: '',
      userId: '',
      roomId: 'general',
      isConnected: false,
      stream: null,
      status: 'Ready to connect'
    };
  },
  mounted() {
    console.log('🚀 gRPC client initialized');
  },
  beforeUnmount() {
    this.disconnectFromStream();
  },
  methods: {
    toggleConnection() {
      if (this.isConnected) {
        this.disconnectFromStream();
      } else {
        this.connectToStream();
      }
    },

    async connectToStream() {
      if (!this.validateConnectionParams()) {
        return;
      }

      try {
        this.status = '🔄 Connecting to gRPC backend...';

        await this.loadMessageHistory();

        const request = createStreamRequest(this.roomId);

        this.setupStreamHandlers(request);
        this.isConnected = true;
        this.status = '✅ Connected to chat';

      } catch (error) {
        this.status = 'Connection error: ' + error.message;
        this.isConnected = false;
      }
    },

    setupStreamHandlers(request) {
      this.stream = client.streamMessages(request, {});

      this.stream.on('data', (response) => {
        this.handleStreamData(response);
      });

      this.stream.on('error', (error) => {
        this.handleStreamError(error);
      });

      this.stream.on('end', () => {
        this.handleStreamEnd();
      });

      this.stream.on('status', (status) => {
      });
    },

    handleStreamData(response) {
      try {

        let messageData;

        if (response instanceof Uint8Array) {
          messageData = this.parseMessageResponse(response);
        } else if (response.getUserId) {
          messageData = {
            messageId: response.getMessageId(),
            userId: response.getUserId(),
            content: response.getContent(),
            timestamp: response.getTimestamp(),
            roomId: response.getRoomId()
          };
        } else {
          return;
        }


        if (messageData && messageData.userId && messageData.content) {
          const isDuplicate = this.messages.some(msg =>
            msg.messageId === messageData.messageId
          );

          if (!isDuplicate) {
            this.messages.push(messageData);
            this.scrollToBottom();
          }
        }

      } catch (parseError) {
        console.error('❌ Error parsing stream message:', parseError, response);
      }
    },

    handleStreamError(error) {
      this.isConnected = false;
      this.status = 'Stream error: ' + error.message;
      console.error('❌ Stream error:', error);
    },

    handleStreamEnd() {
      this.isConnected = false;
      this.status = 'Stream ended';
    },

    disconnectFromStream() {
      if (this.stream) {
        this.stream.cancel();
        this.stream = null;
      }
      this.isConnected = false;
      this.status = 'Disconnected';
    },

    async sendMessage() {
      if (!this.canSendMessage()) {
        return;
      }

      try {
        this.status = '📤 Sending message...';
        const request = createMessageRequest(this.userId, this.newMessage, this.roomId);

        const response = await this.sendMessageRequest(request);

        if (response && response.userId) {
          this.messages.push({
            messageId: response.messageId || 'temp-' + Date.now(),
            userId: response.userId,
            content: response.content,
            timestamp: response.timestamp || new Date().toISOString(),
            roomId: response.roomId || this.roomId
          });

          this.scrollToBottom();
        }

        this.newMessage = '';
        this.status = '✅ Message sent';

      } catch (error) {
        console.error('❌ Failed to send message:', error);
        this.status = 'Failed to send message: ' + error.message;
      }
    },

    sendMessageRequest(request) {
      return new Promise((resolve, reject) => {
        client.sendMessage(request, {}, (error, response) => {
          if (error) {
            reject(error);
          } else {
            if (response instanceof Uint8Array) {
              const parsedResponse = this.parseMessageResponse(response);
              resolve(parsedResponse);
            } else {
              resolve(response);
            }
          }
        });
      });
    },

    async loadMessageHistory() {
      try {

        const request = createHistoryRequest(this.roomId, this.userId, 50);

        const response = await this.getMessageHistory(request);

        if (response instanceof Uint8Array) {
          const parsedResponse = this.parseHistoryResponse(response);

          if (parsedResponse && parsedResponse.messages) {
            this.messages = parsedResponse.messages;
            this.status = `✅ Loaded ${this.messages.length} real messages`;
            this.scrollToBottom();
          } else {
            this.addRealTestMessages();
          }
        } else if (response && response.getMessagesList) {
          const messagesList = response.getMessagesList();
          this.messages = messagesList.map(msg => ({
            messageId: msg.getMessageId(),
            userId: msg.getUserId(),
            content: msg.getContent(),
            timestamp: msg.getTimestamp(),
            roomId: msg.getRoomId()
          }));
          this.status = `✅ Loaded ${this.messages.length} real messages`;
          this.scrollToBottom();
        } else {
          this.addRealTestMessages();
        }

      } catch (error) {
        console.error('❌ Failed to load message history:', error);
        this.status = 'Error loading history: ' + error.message;
        this.addRealTestMessages();
      }
    },
    parseHistoryResponse(bytes) {
      try {

        const decoder = new TextDecoder();
        let offset = 0;
        const messages = [];

        while (offset < bytes.length) {
          const tagResult = this.readVarint(bytes, offset);
          if (!tagResult) break;

          const { value: tag, newOffset: tagEnd } = tagResult;
          const fieldNumber = tag >> 3;
          const wireType = tag & 0x07;
          offset = tagEnd;

          if (fieldNumber === 1 && wireType === 2) {
            const lengthResult = this.readVarint(bytes, offset);
            if (!lengthResult) break;

            const { value: messageLength, newOffset: lengthEnd } = lengthResult;
            offset = lengthEnd;

            if (offset + messageLength > bytes.length) {
              break;
            }

            const messageBytes = bytes.slice(offset, offset + messageLength);
            offset += messageLength;

            const message = this.parseMessageResponse(messageBytes);
            if (message && message.userId) {
              messages.push(message);
            }
          } else {
            if (wireType === 2) {
              const lengthResult = this.readVarint(bytes, offset);
              if (!lengthResult) break;
              offset = lengthEnd + lengthResult.value;
            } else if (wireType === 0) {
              const varintResult = this.readVarint(bytes, offset);
              if (!varintResult) break;
              offset = varintResult.newOffset;
            } else {
              break;
            }
          }
        }

        return { messages };

      } catch (error) {
        console.error('❌ Error parsing HistoryResponse:', error);
        return { messages: [] };
      }
    },

    addRealTestMessages() {
      if (this.messages.length === 0) {
        const testMessages = [
          {
            messageId: 'test-' + Date.now(),
            userId: 'system',
            content: 'No historical messages found. Start chatting!',
            timestamp: new Date().toISOString(),
            roomId: this.roomId
          }
        ];
        this.messages = testMessages;
        this.status = 'No historical messages found';
        this.scrollToBottom();
      }
    },

    getMessageHistory(request) {
      return new Promise((resolve, reject) => {
        client.getMessageHistory(request, {}, (error, response) => {
          if (error) {
            console.error('❌ Get message history error:', error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    },

    parseStreamResponse(response) {
      if (response instanceof Uint8Array) {
        return this.parseMessageResponse(response);
      } else {
        return {
          messageId: response.getMessageId ? response.getMessageId() : '',
          userId: response.getUserId ? response.getUserId() : '',
          content: response.getContent ? response.getContent() : '',
          timestamp: response.getTimestamp ? response.getTimestamp() : '',
          roomId: response.getRoomId ? response.getRoomId() : ''
        };
      }
    },

    parseMessageResponse(bytes) {
      try {
        const decoder = new TextDecoder();
        let offset = 0;
        const result = {};

        while (offset < bytes.length) {
          const tagResult = this.readVarint(bytes, offset);
          if (!tagResult) break;

          const { value: tag, newOffset: tagEnd } = tagResult;
          const fieldNumber = tag >> 3;
          const wireType = tag & 0x07;
          offset = tagEnd;

          if (wireType === 2) { 
            const lengthResult = this.readVarint(bytes, offset);
            if (!lengthResult) break;

            const { value: length, newOffset: lengthEnd } = lengthResult;
            offset = lengthEnd;

            if (offset + length > bytes.length) break;

            const stringBytes = bytes.slice(offset, offset + length);
            const stringValue = decoder.decode(stringBytes);
            offset += length;

            const fieldMap = {
              1: 'messageId',
              2: 'userId',
              3: 'content',
              4: 'timestamp',
              5: 'roomId'
            };

            const fieldName = fieldMap[fieldNumber];
            if (fieldName) {
              result[fieldName] = stringValue;
            }
          } else if (wireType === 0) { 
            const varintResult = this.readVarint(bytes, offset);
            if (!varintResult) break;
            offset = varintResult.newOffset;
          } else {
            break;
          }
        }

        return result;

      } catch (error) {
        console.error('❌ Error parsing MessageResponse:', error);
        return null;
      }
    },


    readVarint(bytes, offset) {
      if (offset >= bytes.length) return null;

      let value = 0;
      let shift = 0;
      let byte;
      let currentOffset = offset;

      do {
        if (currentOffset >= bytes.length) return null;
        byte = bytes[currentOffset++];
        value |= (byte & 0x7F) << shift;
        shift += 7;
        if (shift > 28) return null;
      } while (byte & 0x80);

      return { value, newOffset: currentOffset };
    },

    mapFieldToResult(fieldNumber, value, result) {
      const fieldMap = {
        1: 'messageId',
        2: 'userId',
        3: 'content',
        4: 'timestamp',
        5: 'roomId'
      };

      const fieldName = fieldMap[fieldNumber];
      if (fieldName) {
        result[fieldName] = value;
      } else {
        console.log(`🔍 Unknown field number: ${fieldNumber}`);
      }
    },

    validateConnectionParams() {
      if (!this.userId?.trim() || !this.roomId?.trim()) {
        this.status = 'Please enter both username and room ID';
        return false;
      }
      return true;
    },

    canSendMessage() {
      return this.newMessage.trim() && this.userId && this.isConnected;
    },

    createErrorResponse() {
      return {
        messageId: 'parse-error',
        userId: 'system',
        content: 'Failed to parse response',
        timestamp: new Date().toISOString(),
        roomId: this.roomId
      };
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return timestamp;
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.status {
  padding: 8px 15px;
  background: #e9ecef;
  text-align: center;
  font-size: 0.9em;
  color: #495057;
}

.history-btn {
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-btn:hover:not(:disabled) {
  background: #218838;
}

.history-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.chat-app {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.chat-app h1 {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  text-align: center;
  margin: 0;
}

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

.chat-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.user-info {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-input,
.room-input {
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

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.message {
  margin-bottom: 15px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 80%;
}

.own-message {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.timestamp {
  font-size: 0.8em;
  opacity: 0.8;
}

.message-content {
  word-wrap: break-word;
}

.no-messages {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-style: italic;
}

.input-area {
  padding: 15px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.message-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>