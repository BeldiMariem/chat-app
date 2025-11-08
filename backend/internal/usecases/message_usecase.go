package usecases

import (
	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories"
	"context"
	"fmt"
)

type MessageUseCase interface {
	SendMessage(ctx context.Context, userID, username, content, roomID string) (*entities.Message, error)
	GetMessageHistory(ctx context.Context, roomID string, limit int) ([]*entities.Message, error)
	StreamMessages(ctx context.Context, roomID string) (<-chan *entities.Message, error)
}

type messageUseCase struct {
	messageRepo repositories.MessageRepository
	authUseCase AuthUseCase
}

func NewMessageUseCase(messageRepo repositories.MessageRepository, authUseCase AuthUseCase) MessageUseCase {
	return &messageUseCase{
		messageRepo: messageRepo,
		authUseCase: authUseCase,
	}
}

func (uc *messageUseCase) SendMessage(ctx context.Context, userID, username, content, roomID string) (*entities.Message, error) {
	message := &entities.Message{
		UserID:   userID,
		Username: username,
		Content:  content,
		RoomID:   roomID,
	}

	return uc.messageRepo.Create(ctx, message)
}

func (uc *messageUseCase) GetMessageHistory(ctx context.Context, roomID string, limit int) ([]*entities.Message, error) {
	if limit <= 0 {
		limit = 50
	}
	return uc.messageRepo.GetByRoomID(ctx, roomID, limit)
}

func (uc *messageUseCase) StreamMessages(ctx context.Context, roomID string) (<-chan *entities.Message, error) {
	return uc.messageRepo.StreamByRoomID(ctx, roomID)
}

func (uc *messageUseCase) SendMessageWithAuth(ctx context.Context, token, content, roomID string) (*entities.Message, error) {
	user, err := uc.authUseCase.ValidateToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("unauthorized: %v", err)
	}

	return uc.SendMessage(ctx, user.ID, user.Username, content, roomID)
}

func (uc *messageUseCase) GetMessageHistoryWithAuth(ctx context.Context, token, roomID string, limit int) ([]*entities.Message, error) {
	_, err := uc.authUseCase.ValidateToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("unauthorized: %v", err)
	}

	return uc.GetMessageHistory(ctx, roomID, limit)
}
