import * as grpcWeb from 'grpc-web';
import { ChatServiceClient } from './chat_grpc_web_pb.js';

export const client = new ChatServiceClient('http://localhost:8081', null, null);

export function createMessageRequest(userId, content, roomId) {
  return createManualRequest('MessageRequest', { 
    userId: String(userId || ''), 
    content: String(content || ''), 
    roomId: String(roomId || 'general') 
  });
}

export function createStreamRequest(roomId) {
  return createManualRequest('StreamRequest', { 
    roomId: String(roomId || 'general') 
  });
}

function createManualRequest(type, data) {
  return {
    serializeBinary: () => {
      let result;
      
      if (type === 'StreamRequest' && data.roomId) {
        result = createStringField(1, data.roomId);
      } else if (type === 'MessageRequest') {
        const parts = [];
        
        if (data.userId) {
          parts.push(createStringField(1, data.userId));
        }
        if (data.content) {
          parts.push(createStringField(2, data.content));
        }
        if (data.roomId) {
          parts.push(createStringField(3, data.roomId));
        }
        
        result = concatenateArrays(parts);
      } else {
        result = new Uint8Array(0);
      }
      
      return result;
    },
    
    toObject: () => data
  };
}

function createStringField(fieldNumber, value) {
  const valueBytes = new TextEncoder().encode(String(value));
  
  const tag = (fieldNumber << 3) | 2;
  const tagBytes = encodeVarint(tag);
  
  const lengthBytes = encodeVarint(valueBytes.length);
  
  const result = new Uint8Array(tagBytes.length + lengthBytes.length + valueBytes.length);
  result.set(tagBytes, 0);
  result.set(lengthBytes, tagBytes.length);
  result.set(valueBytes, tagBytes.length + lengthBytes.length);
  
  return result;
}

function encodeVarint(value) {
  const bytes = [];
  let num = value;
  
  do {
    let byte = num & 0x7F;
    num = num >>> 7;
    if (num !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (num !== 0);
  
  return new Uint8Array(bytes);
}

function concatenateArrays(arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  
  return result;
}