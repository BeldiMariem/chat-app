package handlers

import (
	"context"
	"log"
	"time"

	pb "chat-app/backend/internal/interfaces/grpc/proto"
	"chat-app/backend/internal/usecases"
)

type ChatHandler struct {
	pb.UnimplementedChatServiceServer
	messageUseCase usecases.MessageUseCase
	authUseCase    usecases.AuthUseCase
}

func NewChatHandler(messageUseCase usecases.MessageUseCase, authUseCase usecases.AuthUseCase) *ChatHandler {
	return &ChatHandler{
		messageUseCase: messageUseCase,
		authUseCase:    authUseCase,
	}
}

func (h *ChatHandler) Register(ctx context.Context, req *pb.UserRequest) (*pb.AuthResponse, error) {
	log.Printf("Register attempt for user: %s", req.GetUsername())

	token, err := h.authUseCase.Register(ctx, req.GetUsername(), req.GetPassword())
	if err != nil {
		return &pb.AuthResponse{
			Success: false,
			Error:   err.Error(),
		}, nil
	}

	user, _ := h.authUseCase.ValidateToken(ctx, token.Token)

	return &pb.AuthResponse{
		Success:  true,
		Token:    token.Token,
		UserId:   user.ID,
		Username: user.Username,
	}, nil
}

func (h *ChatHandler) Login(ctx context.Context, req *pb.UserRequest) (*pb.AuthResponse, error) {
	log.Printf("Login attempt for user: %s", req.GetUsername())

	token, err := h.authUseCase.Login(ctx, req.GetUsername(), req.GetPassword())
	if err != nil {
		return &pb.AuthResponse{
			Success: false,
			Error:   err.Error(),
		}, nil
	}

	user, _ := h.authUseCase.ValidateToken(ctx, token.Token)

	return &pb.AuthResponse{
		Success:  true,
		Token:    token.Token,
		UserId:   user.ID,
		Username: user.Username,
	}, nil
}

func (h *ChatHandler) ValidateToken(ctx context.Context, req *pb.TokenRequest) (*pb.UserResponse, error) {
	user, err := h.authUseCase.ValidateToken(ctx, req.GetToken())
	if err != nil {
		return &pb.UserResponse{
			Valid: false,
		}, nil
	}

	return &pb.UserResponse{
		UserId:   user.ID,
		Username: user.Username,
		Valid:    true,
	}, nil
}

func (h *ChatHandler) SendMessage(ctx context.Context, req *pb.MessageRequest) (*pb.MessageResponse, error) {
	log.Printf("Storing message from user: %s", req.GetUserId())

	message, err := h.messageUseCase.SendMessage(ctx, req.GetUserId(), req.GetUsername(), req.GetContent(), req.GetRoomId())
	if err != nil {
		log.Printf("Error storing message: %v", err)
		return nil, err
	}

	log.Printf("Message stored with ID: %s", message.ID)

	return &pb.MessageResponse{
		MessageId: message.ID,
		UserId:    message.UserID,
		Username:  message.Username,
		Content:   message.Content,
		RoomId:    message.RoomID,
		Timestamp: message.Timestamp.Format(time.RFC3339),
	}, nil
}

func (h *ChatHandler) StreamMessages(req *pb.StreamRequest, stream pb.ChatService_StreamMessagesServer) error {
	ctx := stream.Context()
	roomID := req.GetRoomId()

	if token := req.GetToken(); token != "" {
		_, err := h.authUseCase.ValidateToken(ctx, token)
		if err != nil {
			return err
		}
	}

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

			username := "user_" + message.Username
			if user, err := h.authUseCase.ValidateToken(ctx, req.GetToken()); err == nil {
				username = user.Username
			}

			resp := &pb.MessageResponse{
				MessageId: message.ID,
				UserId:    message.UserID,
				Username:  username,
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

	if token := req.GetToken(); token != "" {
		_, err := h.authUseCase.ValidateToken(ctx, token)
		if err != nil {
			return nil, err
		}
	}

	log.Printf("Fetching message history for room: %s", roomID)

	messages, err := h.messageUseCase.GetMessageHistory(ctx, roomID, 50)
	if err != nil {
		log.Printf("Error fetching history: %v", err)
		return nil, err
	}

	var pbMessages []*pb.MessageResponse
	for i := len(messages) - 1; i >= 0; i-- {
		message := messages[i]

		username := "user_" + message.Username
		if user, err := h.authUseCase.ValidateToken(ctx, req.GetToken()); err == nil {
			username = user.Username
		}

		pbMessages = append(pbMessages, &pb.MessageResponse{
			MessageId: message.ID,
			UserId:    message.UserID,
			Username:  username,
			Content:   message.Content,
			RoomId:    message.RoomID,
			Timestamp: message.Timestamp.Format(time.RFC3339),
		})
	}

	log.Printf("Returning %d historical messages", len(pbMessages))
	return &pb.HistoryResponse{Messages: pbMessages}, nil
}
