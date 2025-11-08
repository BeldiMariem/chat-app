package repositories

import (
	"chat-app/backend/internal/domain/entities"
	"context"
)

type MessageRepository interface {
	Create(ctx context.Context, message *entities.Message) (*entities.Message, error)
	GetByRoomID(ctx context.Context, roomID string, limit int) ([]*entities.Message, error)
	StreamByRoomID(ctx context.Context, roomID string) (<-chan *entities.Message, error)
}
