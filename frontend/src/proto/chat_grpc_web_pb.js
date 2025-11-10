import * as grpcWeb from 'grpc-web';

export class ChatServiceClient {
  constructor(hostname, credentials, options) {
    if (!options) options = {};
    options.format = 'binary';
    
    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname.replace(/\/+$/, '');
  }

  register(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
      metadata = {};
    }
    
    return this.client_.rpcCall(
      `${this.hostname_}/chat.ChatService/Register`,
      request,
      metadata || {},
      methodDescriptor_ChatService_Register,
      callback
    );
  }

  login(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
      metadata = {};
    }    
    return this.client_.rpcCall(
      `${this.hostname_}/chat.ChatService/Login`,
      request,
      metadata || {},
      methodDescriptor_ChatService_Login,
      callback
    );
  }

  validateToken(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
      metadata = {};
    }

    return this.client_.rpcCall(
      `${this.hostname_}/chat.ChatService/ValidateToken`,
      request,
      metadata || {},
      methodDescriptor_ChatService_ValidateToken,
      callback
    );
  }

  sendMessage(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
      metadata = {};
    }
    
    return this.client_.rpcCall(
      `${this.hostname_}/chat.ChatService/SendMessage`,
      request,
      metadata || {},
      methodDescriptor_ChatService_SendMessage,
      callback
    );
  }

  streamMessages(request, metadata) {    
    return this.client_.serverStreaming(
      `${this.hostname_}/chat.ChatService/StreamMessages`,
      request,
      metadata || {},
      methodDescriptor_ChatService_StreamMessages
    );
  }

  getMessageHistory(request, metadata, callback) {
    if (arguments.length === 2) {
      callback = arguments[1];
      metadata = {};
    }    
    return this.client_.rpcCall(
      `${this.hostname_}/chat.ChatService/GetMessageHistory`,
      request,
      metadata || {},
      methodDescriptor_ChatService_GetMessageHistory,
      callback
    );
  }
}

export class ChatServicePromiseClient {
  constructor(hostname, credentials, options) {
    this.client_ = new ChatServiceClient(hostname, credentials, options);
  }

  register(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.register(request, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  login(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.login(request, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  validateToken(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.validateToken(request, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  sendMessage(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.sendMessage(request, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  streamMessages(request, metadata) {
    return this.client_.streamMessages(request, metadata);
  }

  getMessageHistory(request, metadata) {
    return new Promise((resolve, reject) => {
      this.client_.getMessageHistory(request, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

const methodDescriptor_ChatService_Register = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/Register',
  grpcWeb.MethodType.UNARY,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      return request.serializeBinary();
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes; 
  }
);

const methodDescriptor_ChatService_Login = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/Login',
  grpcWeb.MethodType.UNARY,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      return request.serializeBinary();
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes; 
  }
);

const methodDescriptor_ChatService_ValidateToken = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/ValidateToken',
  grpcWeb.MethodType.UNARY,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      return request.serializeBinary();
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes; 
  }
);

const methodDescriptor_ChatService_SendMessage = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/SendMessage',
  grpcWeb.MethodType.UNARY,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      const result = request.serializeBinary();
      return result;
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes;
  }
);

const methodDescriptor_ChatService_StreamMessages = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/StreamMessages',
  grpcWeb.MethodType.SERVER_STREAMING,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      return request.serializeBinary();
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes; 
  }
);

const methodDescriptor_ChatService_GetMessageHistory = new grpcWeb.MethodDescriptor(
  '/chat.ChatService/GetMessageHistory',
  grpcWeb.MethodType.UNARY,
  Object,
  Object,
  function(request) {
    if (typeof request.serializeBinary === 'function') {
      return request.serializeBinary();
    }
    return new Uint8Array();
  },
  function(responseBytes) {
    return responseBytes; 
  }
);