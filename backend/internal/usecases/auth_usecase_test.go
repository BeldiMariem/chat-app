package usecases_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories/mocks"
	"chat-app/backend/internal/usecases"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthUseCase_Register(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	authUC := usecases.NewAuthUseCase(mockUserRepo)

	ctx := context.Background()
	username := "mariem"
	password := "password_mariem"

	t.Run("successful registration", func(t *testing.T) {
		mockUserRepo.EXPECT().
			CreateUser(ctx, gomock.Any()).
			DoAndReturn(func(ctx context.Context, user *entities.User) error {
				assert.Equal(t, username, user.Username)
				assert.NotEmpty(t, user.PasswordHash)
				assert.NotEmpty(t, user.ID)
				return nil
			})

		mockUserRepo.EXPECT().
			StoreToken(ctx, gomock.Any()).
			DoAndReturn(func(ctx context.Context, token *entities.AuthToken) error {
				assert.NotEmpty(t, token.Token)
				assert.NotEmpty(t, token.UserID)
				assert.True(t, token.ExpiresAt.After(time.Now()))
				return nil
			})

		token, err := authUC.Register(ctx, username, password)
		require.NoError(t, err)
		require.NotNil(t, token)
		assert.NotEmpty(t, token.Token)
	})

	t.Run("username already exists", func(t *testing.T) {
		mockUserRepo.EXPECT().
			CreateUser(ctx, gomock.Any()).
			Return(fmt.Errorf("username already exists"))

		token, err := authUC.Register(ctx, username, password)
		require.Error(t, err)
		assert.Nil(t, token)
	})

	t.Run("invalid username", func(t *testing.T) {
		token, err := authUC.Register(ctx, "ab", "password_mariem")
		require.Error(t, err)
		assert.Nil(t, token)
	})

	t.Run("invalid password", func(t *testing.T) {
		token, err := authUC.Register(ctx, username, "123")
		require.Error(t, err)
		assert.Nil(t, token)
	})
}

func TestAuthUseCase_Login(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	authUC := usecases.NewAuthUseCase(mockUserRepo)

	ctx := context.Background()
	username := "mariem"
	password := "password_mariem"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	user := &entities.User{
		ID:           "user123",
		Username:     username,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
	}

	t.Run("successful login", func(t *testing.T) {
		mockUserRepo.EXPECT().
			GetUserByUsername(ctx, username).
			Return(user, nil)

		mockUserRepo.EXPECT().
			StoreToken(ctx, gomock.Any()).
			Return(nil)

		token, err := authUC.Login(ctx, username, password)
		require.NoError(t, err)
		assert.NotNil(t, token)
	})

	t.Run("invalid credentials", func(t *testing.T) {
		mockUserRepo.EXPECT().
			GetUserByUsername(ctx, username).
			Return(user, nil)

		token, err := authUC.Login(ctx, username, "wrongpassword")
		require.Error(t, err)
		assert.Nil(t, token)
	})

	t.Run("user not found", func(t *testing.T) {
		mockUserRepo.EXPECT().
			GetUserByUsername(ctx, username).
			Return(nil, fmt.Errorf("user not found"))

		token, err := authUC.Login(ctx, username, password)
		require.Error(t, err)
		assert.Nil(t, token)
	})
}

func TestAuthUseCase_ValidateToken(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mocks.NewMockUserRepository(ctrl)
	authUC := usecases.NewAuthUseCase(mockUserRepo)

	ctx := context.Background()
	tokenStr := "valid-token"
	userID := "user123"
	authToken := &entities.AuthToken{
		Token:     tokenStr,
		UserID:    userID,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	user := &entities.User{
		ID:       userID,
		Username: "testuser",
	}

	t.Run("valid token", func(t *testing.T) {
		mockUserRepo.EXPECT().
			ValidateToken(ctx, tokenStr).
			Return(authToken, nil)

		mockUserRepo.EXPECT().
			GetUserByID(ctx, userID).
			Return(user, nil)

		result, err := authUC.ValidateToken(ctx, tokenStr)
		require.NoError(t, err)
		assert.Equal(t, user, result)
	})

	t.Run("invalid token", func(t *testing.T) {
		mockUserRepo.EXPECT().
			ValidateToken(ctx, "invalid-token").
			Return(nil, fmt.Errorf("token not found"))

		result, err := authUC.ValidateToken(ctx, "invalid-token")
		require.Error(t, err)
		assert.Nil(t, result)
	})
}
