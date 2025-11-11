package handlers

import (
	"context"
	"testing"
	"time"

	"chat-app/backend/internal/domain/entities"
	pb "chat-app/backend/internal/interfaces/grpc/proto"
	"chat-app/backend/internal/usecases/mocks"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChatHandler_Register(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgUC := mocks.NewMockMessageUseCase(ctrl)
	mockAuthUC := mocks.NewMockAuthUseCase(ctrl)
	handler := NewChatHandler(mockMsgUC, mockAuthUC)

	ctx := context.Background()

	t.Run("successful registration", func(t *testing.T) {
		token := &entities.AuthToken{
			Token:     "test-token",
			UserID:    "user123",
			ExpiresAt: time.Now().Add(24 * time.Hour),
		}
		user := &entities.User{
			ID:       "user123",
			Username: "testuser",
		}

		mockAuthUC.EXPECT().
			Register(ctx, "mariem", "password_mariem").
			Return(token, nil)

		mockAuthUC.EXPECT().
			ValidateToken(ctx, "test-token").
			Return(user, nil)

		req := &pb.UserRequest{
			Username: "mariem",
			Password: "password_mariem",
		}

		resp, err := handler.Register(ctx, req)
		require.NoError(t, err)
		assert.True(t, resp.Success)
		assert.Equal(t, "test-token", resp.Token)
		assert.Equal(t, "user123", resp.UserId)
	})

	t.Run("registration failure", func(t *testing.T) {
		mockAuthUC.EXPECT().
			Register(ctx, "mariem", "password_mariem").
			Return(nil, assert.AnError)

		req := &pb.UserRequest{
			Username: "mariem",
			Password: "password_mariem",
		}

		resp, err := handler.Register(ctx, req)
		require.NoError(t, err)
		assert.False(t, resp.Success)
		assert.Contains(t, resp.Error, "error")
	})
}

func TestChatHandler_Login(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgUC := mocks.NewMockMessageUseCase(ctrl)
	mockAuthUC := mocks.NewMockAuthUseCase(ctrl)
	handler := NewChatHandler(mockMsgUC, mockAuthUC)

	ctx := context.Background()

	t.Run("successful login", func(t *testing.T) {
		token := &entities.AuthToken{
			Token:     "test-token",
			UserID:    "user123",
			ExpiresAt: time.Now().Add(24 * time.Hour),
		}
		user := &entities.User{
			ID:       "user123",
			Username: "mariem",
		}

		mockAuthUC.EXPECT().
			Login(ctx, "mariem", "password_mariem").
			Return(token, nil)

		mockAuthUC.EXPECT().
			ValidateToken(ctx, "test-token").
			Return(user, nil)

		req := &pb.UserRequest{
			Username: "mariem",
			Password: "password_mariem",
		}

		resp, err := handler.Login(ctx, req)
		require.NoError(t, err)
		assert.True(t, resp.Success)
		assert.Equal(t, "test-token", resp.Token)
	})

	t.Run("login failure", func(t *testing.T) {
		mockAuthUC.EXPECT().
			Login(ctx, "mariem", "password_mariem").
			Return(nil, assert.AnError)

		req := &pb.UserRequest{
			Username: "mariem",
			Password: "password_mariem",
		}

		resp, err := handler.Login(ctx, req)
		require.NoError(t, err)
		assert.False(t, resp.Success)
		assert.Contains(t, resp.Error, "error")
	})
}

func TestChatHandler_SendMessage(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgUC := mocks.NewMockMessageUseCase(ctrl)
	mockAuthUC := mocks.NewMockAuthUseCase(ctrl)
	handler := NewChatHandler(mockMsgUC, mockAuthUC)

	ctx := context.Background()

	t.Run("successful message send", func(t *testing.T) {
		message := &entities.Message{
			ID:        "msg123",
			UserID:    "user123",
			Username:  "testuser",
			Content:   "Hello world",
			RoomID:    "room123",
			Timestamp: time.Now(),
		}

		mockMsgUC.EXPECT().
			SendMessage(ctx, "user123", "testuser", "Hello world", "room123").
			Return(message, nil)

		req := &pb.MessageRequest{
			UserId:   "user123",
			Username: "testuser",
			Content:  "Hello world",
			RoomId:   "room123",
		}

		resp, err := handler.SendMessage(ctx, req)
		require.NoError(t, err)
		assert.Equal(t, "msg123", resp.MessageId)
		assert.Equal(t, "Hello world", resp.Content)
	})

	t.Run("message send error", func(t *testing.T) {
		mockMsgUC.EXPECT().
			SendMessage(ctx, "user123", "testuser", "Hello world", "room123").
			Return(nil, assert.AnError)

		req := &pb.MessageRequest{
			UserId:   "user123",
			Username: "testuser",
			Content:  "Hello world",
			RoomId:   "room123",
		}

		resp, err := handler.SendMessage(ctx, req)
		require.Error(t, err)
		assert.Nil(t, resp)
	})
}
