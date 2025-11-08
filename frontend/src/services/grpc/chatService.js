import { client, createMessageRequest, createStreamRequest, createHistoryRequest } from './client.js';

export class ChatService {
  constructor() {
    this.client = client; 
  }

  async sendMessage(userId, content, roomId) {
    return new Promise((resolve, reject) => {
      const request = createMessageRequest(userId, content, roomId);

      this.client.sendMessage(request, {}, (error, response) => {
        if (error) {
          reject(new Error(`Failed to send message: ${error.message}`));
        } else {
          let result;
          if (response instanceof Uint8Array) {
            result = this.parseMessageResponse(response);
          } else {
            result = {
              messageId: response.getMessageId(),
              userId: response.getUserId(),
              content: response.getContent(),
              timestamp: response.getTimestamp(),
              roomId: response.getRoomId()
            };
          }
          resolve(result);
        }
      });
    });
  }

  async getMessageHistory(roomId, limit = 50) {
    return new Promise((resolve, reject) => {
      const request = createHistoryRequest(roomId, '', limit);

      this.client.getMessageHistory(request, {}, (error, response) => {
        if (error) {
          reject(new Error(`Failed to get message history: ${error.message}`));
        } else {
          let messages;
          if (response instanceof Uint8Array) {
            const parsedResponse = this.parseHistoryResponse(response);
            messages = parsedResponse?.messages || [];
          } else if (response && response.getMessagesList) {
            const messagesList = response.getMessagesList();
            messages = messagesList.map(msg => ({
              messageId: msg.getMessageId(),
              userId: msg.getUserId(),
              content: msg.getContent(),
              timestamp: msg.getTimestamp(),
              roomId: msg.getRoomId()
            }));
          } else {
            messages = [];
          }
          resolve(messages);
        }
      });
    });
  }

  streamMessages(roomId, callbacks) {
    const request = createStreamRequest(roomId);

    const stream = this.client.streamMessages(request, {});

    stream.on('data', (response) => {
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
      }

      if (messageData && messageData.userId && messageData.content) {
        callbacks.onMessage?.(messageData);
      }
    });

    stream.on('error', (error) => {
      callbacks.onError?.(error);
    });

    stream.on('end', () => {
      callbacks.onEnd?.();
    });

    stream.on('status', (status) => {
      callbacks.onStatus?.(status);
    });

    return {
      cancel: () => stream.cancel(),
      getStatus: () => stream.getStatus()
    };
  }

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
  }

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
  }

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
  }
}

export const chatService = new ChatService();