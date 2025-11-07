import * as grpcWeb from 'grpc-web';
import { MessageRequest, MessageResponse, StreamRequest } from './chat_pb.js';

export class ChatServiceClient {
  constructor(hostname, credentials, options) {
    if (!options) options = {};
    options.format = 'binary';    
    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname.replace(/\/+$/, '');
  }

  sendMessage(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
    }

    console.log('📤 Sending REAL message to backend...');
    
    return this.client_.rpcCall(
      this.hostname_ + '/chat.ChatService/SendMessage',
      request,
      metadata || {},
      methodDescriptor_ChatService_SendMessage,
      callback
    );
  }

  streamMessages(request, metadata) {
    console.log('📡 Starting REAL stream to backend...');
    
    return this.client_.serverStreaming(
      this.hostname_ + '/chat.ChatService/StreamMessages',
      request,
      metadata || {},
      methodDescriptor_ChatService_StreamMessages
    );
  }
}

export class ChatServicePromiseClient {
  constructor(hostname, credentials, options) {
    this.client_ = new ChatServiceClient(hostname, credentials, options);
  }

  sendMessage(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.sendMessage(request, metadata, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  streamMessages(request, metadata) {
    return this.client_.streamMessages(request, metadata);
  }
}

// Method descriptors for manual objects
const methodDescriptor_ChatService_SendMessage = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/SendMessage',
  grpcWeb.MethodType.UNARY,
  Object, // Use Object instead of MessageRequest
  Object, // Use Object instead of MessageResponse
  function(request) {
    return request.serializeBinary();
  },
  function(responseBytes) {
    // For now, just return the raw bytes - we'll handle deserialization in App.vue
    return responseBytes;
  }
);

const methodDescriptor_ChatService_StreamMessages = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/StreamMessages',
  grpcWeb.MethodType.SERVER_STREAMING,
  Object, // Use Object instead of StreamRequest
  Object, // Use Object instead of MessageResponse
  function(request) {
    return request.serializeBinary();
  },
  function(responseBytes) {
    // Return raw bytes for streaming too
    return responseBytes;
  }
);