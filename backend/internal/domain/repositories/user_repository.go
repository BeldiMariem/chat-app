package repositories

import (
	"chat-app/backend/internal/domain/entities"
	"context"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *entities.User) error
	GetUserByUsername(ctx context.Context, username string) (*entities.User, error)
	GetUserByID(ctx context.Context, userID string) (*entities.User, error)
	StoreToken(ctx context.Context, token *entities.AuthToken) error
	ValidateToken(ctx context.Context, token string) (*entities.AuthToken, error)
	DeleteToken(ctx context.Context, token string) error
}
