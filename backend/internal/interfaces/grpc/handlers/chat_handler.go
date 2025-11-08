package handlers

import (
	"context"
	"log"
	"time"

	"chat-app/backend/internal/usecases"
	pb "chat-app/backend/proto"
)

type ChatHandler struct {
	pb.UnimplementedChatServiceServer
	messageUseCase usecases.MessageUseCase
}

func NewChatHandler(messageUseCase usecases.MessageUseCase) *ChatHandler {
	return &ChatHandler{
		messageUseCase: messageUseCase,
	}
}

func (h *ChatHandler) SendMessage(ctx context.Context, req *pb.MessageRequest) (*pb.MessageResponse, error) {
	log.Printf("Storing message in Firestore: %+v", req)

	message, err := h.messageUseCase.SendMessage(ctx, req.GetUserId(), req.GetContent(), req.GetRoomId())
	if err != nil {
		log.Printf("Error storing message: %v", err)
		return nil, err
	}

	log.Printf("Message stored with ID: %s", message.ID)

	return &pb.MessageResponse{
		MessageId: message.ID,
		UserId:    message.UserID,
		Content:   message.Content,
		RoomId:    message.RoomID,
		Timestamp: message.Timestamp.Format(time.RFC3339),
	}, nil
}

func (h *ChatHandler) StreamMessages(req *pb.StreamRequest, stream pb.ChatService_StreamMessagesServer) error {
	ctx := stream.Context()
	roomID := req.GetRoomId()

	log.Printf("Starting message stream for room: %s", roomID)

	messageChan, err := h.messageUseCase.StreamMessages(ctx, roomID)
	if err != nil {
		return err
	}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case message, ok := <-messageChan:
			if !ok {
				return nil
			}

			resp := &pb.MessageResponse{
				MessageId: message.ID,
				UserId:    message.UserID,
				Content:   message.Content,
				RoomId:    message.RoomID,
				Timestamp: message.Timestamp.Format(time.RFC3339),
			}

			log.Printf("Sending message to stream: %s", resp.GetContent())

			if err := stream.Send(resp); err != nil {
				log.Printf("Stream send error: %v", err)
				return err
			}
		}
	}
}

func (h *ChatHandler) GetMessageHistory(ctx context.Context, req *pb.HistoryRequest) (*pb.HistoryResponse, error) {
	roomID := req.GetRoomId()
	log.Printf("Fetching message history for room: %s", roomID)

	messages, err := h.messageUseCase.GetMessageHistory(ctx, roomID, 50)
	if err != nil {
		log.Printf("Error fetching history: %v", err)
		return nil, err
	}

	var pbMessages []*pb.MessageResponse
	for i := len(messages) - 1; i >= 0; i-- {
		message := messages[i]
		pbMessages = append(pbMessages, &pb.MessageResponse{
			MessageId: message.ID,
			UserId:    message.UserID,
			Content:   message.Content,
			RoomId:    message.RoomID,
			Timestamp: message.Timestamp.Format(time.RFC3339),
		})
	}

	log.Printf("Returning %d historical messages", len(pbMessages))
	return &pb.HistoryResponse{Messages: pbMessages}, nil
}
