// Wrapper for the generated protobuf classes to fix inheritance issues
import * as jspb from 'google-protobuf';
import * as grpcWeb from 'grpc-web';

// Import the generated classes
import * as chatPb from './chat_pb.js';
import * as chatGrpcWeb from './chat_grpc_web_pb.js';

// Re-export the classes with proper setup
export const MessageRequest = chatPb.MessageRequest;
export const MessageResponse = chatPb.MessageResponse;
export const StreamRequest = chatPb.StreamRequest;
export const ChatServiceClient = chatGrpcWeb.ChatServiceClient;

// Helper function to create instances that work properly
export function createMessageRequest(data = {}) {
  const request = new MessageRequest();
  if (data.userId) request.setUserId(data.userId);
  if (data.content) request.setContent(data.content);
  if (data.roomId) request.setRoomId(data.roomId);
  return request;
}

export function createStreamRequest(data = {}) {
  const request = new StreamRequest();
  if (data.roomId) request.setRoomId(data.roomId);
  return request;
}