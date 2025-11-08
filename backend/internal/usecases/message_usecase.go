package usecases

import (
	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories"
	"context"
)

type MessageUseCase interface {
	SendMessage(ctx context.Context, userID, content, roomID string) (*entities.Message, error)
	GetMessageHistory(ctx context.Context, roomID string, limit int) ([]*entities.Message, error)
	StreamMessages(ctx context.Context, roomID string) (<-chan *entities.Message, error)
}

type messageUseCase struct {
	messageRepo repositories.MessageRepository
}

func NewMessageUseCase(messageRepo repositories.MessageRepository) MessageUseCase {
	return &messageUseCase{messageRepo: messageRepo}
}

func (uc *messageUseCase) SendMessage(ctx context.Context, userID, content, roomID string) (*entities.Message, error) {
	message := &entities.Message{
		UserID:  userID,
		Content: content,
		RoomID:  roomID,
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
