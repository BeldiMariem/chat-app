package usecases

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"

	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories"
)

type AuthUseCase interface {
	Register(ctx context.Context, username, password string) (*entities.AuthToken, error)
	Login(ctx context.Context, username, password string) (*entities.AuthToken, error)
	ValidateToken(ctx context.Context, token string) (*entities.User, error)
	Logout(ctx context.Context, token string) error
}

type authUseCase struct {
	userRepo repositories.UserRepository
}

func NewAuthUseCase(userRepo repositories.UserRepository) AuthUseCase {
	return &authUseCase{userRepo: userRepo}
}

func (uc *authUseCase) Register(ctx context.Context, username, password string) (*entities.AuthToken, error) {
	if len(username) < 3 {
		return nil, fmt.Errorf("username must be at least 3 characters")
	}
	if len(password) < 6 {
		return nil, fmt.Errorf("password must be at least 6 characters")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	user := &entities.User{
		ID:           generateID(),
		Username:     username,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
	}

	if err := uc.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	return uc.generateToken(ctx, user.ID)
}

func (uc *authUseCase) Login(ctx context.Context, username, password string) (*entities.AuthToken, error) {
	user, err := uc.userRepo.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	return uc.generateToken(ctx, user.ID)
}

func (uc *authUseCase) ValidateToken(ctx context.Context, token string) (*entities.User, error) {
	authToken, err := uc.userRepo.ValidateToken(ctx, token)
	if err != nil {
		return nil, err
	}

	user, err := uc.userRepo.GetUserByID(ctx, authToken.UserID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (uc *authUseCase) Logout(ctx context.Context, token string) error {
	return uc.userRepo.DeleteToken(ctx, token)
}

func (uc *authUseCase) generateToken(ctx context.Context, userID string) (*entities.AuthToken, error) {
	token := generateToken()
	authToken := &entities.AuthToken{
		Token:     token,
		UserID:    userID,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := uc.userRepo.StoreToken(ctx, authToken); err != nil {
		return nil, err
	}

	return authToken, nil
}

func generateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func generateID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
