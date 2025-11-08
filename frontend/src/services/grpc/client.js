import * as grpcWeb from 'grpc-web';
import { ChatServiceClient } from '../../proto/chat_grpc_web_pb.js';

let MessageRequest, StreamRequest, HistoryRequest, UserRequest, TokenRequest;

try {
  const chatPb = require('../../proto/chat_pb.js');
  MessageRequest = chatPb.MessageRequest;
  StreamRequest = chatPb.StreamRequest;
  HistoryRequest = chatPb.HistoryRequest;
  UserRequest = chatPb.UserRequest;
  TokenRequest = chatPb.TokenRequest;
} catch (e) {
  MessageRequest = class {
    constructor() {
      this.userId = '';
      this.content = '';
      this.roomId = '';
    }
    setUserId(val) { this.userId = val; }
    setContent(val) { this.content = val; }
    setRoomId(val) { this.roomId = val; }
    serializeBinary() { 
      return this.serializeToBinary();
    }
    serializeToBinary() {
      const parts = [];
      if (this.userId) parts.push(createProtobufField(1, 2, this.userId));
      if (this.content) parts.push(createProtobufField(2, 2, this.content));
      if (this.roomId) parts.push(createProtobufField(3, 2, this.roomId));
      return concatenateArrays(parts);
    }
  };

  StreamRequest = class {
    constructor() {
      this.roomId = '';
    }
    setRoomId(val) { this.roomId = val; }
    serializeBinary() { 
      return this.serializeToBinary();
    }
    serializeToBinary() {
      const parts = [];
      if (this.roomId) parts.push(createProtobufField(1, 2, this.roomId));
      return concatenateArrays(parts);
    }
  };

  HistoryRequest = class {
    constructor() {
      this.roomId = '';
      this.userId = '';
      this.limit = 0;
    }
    setRoomId(val) { this.roomId = val; }
    setUserId(val) { this.userId = val; }
    setLimit(val) { this.limit = val; }
    serializeBinary() { 
      return this.serializeToBinary();
    }
    serializeToBinary() {
      const parts = [];
      if (this.roomId) parts.push(createProtobufField(1, 2, this.roomId));
      if (this.userId) parts.push(createProtobufField(2, 2, this.userId));
      if (this.limit) parts.push(createProtobufField(3, 0, this.limit));
      return concatenateArrays(parts);
    }
  };

  UserRequest = class {
    constructor() {
      this.username = '';
      this.password = '';
    }
    setUsername(val) { this.username = val; }
    setPassword(val) { this.password = val; }
    serializeBinary() { 
      return this.serializeToBinary();
    }
    serializeToBinary() {
      const parts = [];
      if (this.username) parts.push(createProtobufField(1, 2, this.username));
      if (this.password) parts.push(createProtobufField(2, 2, this.password));
      return concatenateArrays(parts);
    }
  };

  TokenRequest = class {
    constructor() {
      this.token = '';
    }
    setToken(val) { this.token = val; }
    serializeBinary() { 
      return this.serializeToBinary();
    }
    serializeToBinary() {
      const parts = [];
      if (this.token) parts.push(createProtobufField(1, 2, this.token));
      return concatenateArrays(parts);
    }
  };
}

export const client = new ChatServiceClient('http://localhost:8081', null, null);

export class GrpcClient {
  constructor() {
    this.client = client;
    this.isConnected = false;
  }

  async connect() {
    this.isConnected = true;
    return true;
  }

  disconnect() {
    this.isConnected = false;
  }

  getClient() {
    return this.client;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const grpcClient = new GrpcClient();

export function createMessageRequest(userId, content, roomId) {
  const request = new MessageRequest();
  request.setUserId(userId || '');
  request.setContent(content || '');
  request.setRoomId(roomId || 'general');
  return request;
}

export function createStreamRequest(roomId) {
  const request = new StreamRequest();
  request.setRoomId(roomId || 'general');
  return request;
}

export function createHistoryRequest(roomId, userId = '', limit = 50) {
  const request = new HistoryRequest();
  request.setRoomId(roomId || 'general');
  if (userId) {
    request.setUserId(userId);
  }
  request.setLimit(limit);
  return request;
}

export function createUserRequest(username, password) {
  const request = new UserRequest();
  request.setUsername(username || '');
  request.setPassword(password || '');
  return request;
}

export function createTokenRequest(token) {
  const request = new TokenRequest();
  request.setToken(token || '');
  return request;
}

function createProtobufField(fieldNumber, wireType, value) {
  const tag = (fieldNumber << 3) | wireType;
  const tagBytes = encodeVarint(tag);
  
  let valueBytes;
  if (wireType === 2) { 
    const stringBytes = new TextEncoder().encode(String(value));
    const lengthBytes = encodeVarint(stringBytes.length);
    valueBytes = new Uint8Array(lengthBytes.length + stringBytes.length);
    valueBytes.set(lengthBytes, 0);
    valueBytes.set(stringBytes, lengthBytes.length);
  } else if (wireType === 0) { 
    valueBytes = encodeVarint(Number(value));
  } else {
    valueBytes = new Uint8Array(0);
  }
  
  const result = new Uint8Array(tagBytes.length + valueBytes.length);
  result.set(tagBytes, 0);
  result.set(valueBytes, tagBytes.length);
  
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