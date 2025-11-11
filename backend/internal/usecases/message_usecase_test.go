package usecases

import (
	"context"
	"testing"
	"time"

	"chat-app/backend/internal/domain/entities"
	repoMocks "chat-app/backend/internal/domain/repositories/mocks"
	ucMocks "chat-app/backend/internal/usecases/mocks"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMessageUseCase_SendMessage(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgRepo := repoMocks.NewMockMessageRepository(ctrl)
	mockAuthUC := ucMocks.NewMockAuthUseCase(ctrl)
	msgUC := NewMessageUseCase(mockMsgRepo, mockAuthUC)

	ctx := context.Background()
	userID := "user123"
	username := "testuser"
	content := "Hello, world!"
	roomID := "room123"

	t.Run("successful message send", func(t *testing.T) {
		mockMsgRepo.EXPECT().
			Create(ctx, gomock.Any()).
			DoAndReturn(func(ctx context.Context, msg *entities.Message) (*entities.Message, error) {
				assert.Equal(t, userID, msg.UserID)
				assert.Equal(t, username, msg.Username)
				assert.Equal(t, content, msg.Content)
				assert.Equal(t, roomID, msg.RoomID)
				msg.ID = "msg123"
				return msg, nil
			})

		message, err := msgUC.SendMessage(ctx, userID, username, content, roomID)
		require.NoError(t, err)
		assert.Equal(t, "msg123", message.ID)
		assert.Equal(t, content, message.Content)
	})

	t.Run("send message error", func(t *testing.T) {
		mockMsgRepo.EXPECT().
			Create(ctx, gomock.Any()).
			Return(nil, assert.AnError)

		message, err := msgUC.SendMessage(ctx, userID, username, content, roomID)
		require.Error(t, err)
		assert.Nil(t, message)
	})
}

func TestMessageUseCase_GetMessageHistory(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgRepo := repoMocks.NewMockMessageRepository(ctrl)
	mockAuthUC := ucMocks.NewMockAuthUseCase(ctrl)
	msgUC := NewMessageUseCase(mockMsgRepo, mockAuthUC)

	ctx := context.Background()
	roomID := "room123"

	t.Run("get message history with default limit", func(t *testing.T) {
		expectedMessages := []*entities.Message{
			{ID: "msg1", Content: "Hello", RoomID: roomID, Timestamp: time.Now()},
			{ID: "msg2", Content: "World", RoomID: roomID, Timestamp: time.Now()},
		}

		mockMsgRepo.EXPECT().
			GetByRoomID(ctx, roomID, 50).
			Return(expectedMessages, nil)

		messages, err := msgUC.GetMessageHistory(ctx, roomID, 0) // 0 should default to 50
		require.NoError(t, err)
		assert.Len(t, messages, 2)
	})

	t.Run("get message history with custom limit", func(t *testing.T) {
		expectedMessages := []*entities.Message{
			{ID: "msg1", Content: "Hello", RoomID: roomID, Timestamp: time.Now()},
		}

		mockMsgRepo.EXPECT().
			GetByRoomID(ctx, roomID, 10).
			Return(expectedMessages, nil)

		messages, err := msgUC.GetMessageHistory(ctx, roomID, 10)
		require.NoError(t, err)
		assert.Len(t, messages, 1)
	})

	t.Run("get message history error", func(t *testing.T) {
		mockMsgRepo.EXPECT().
			GetByRoomID(ctx, roomID, 50).
			Return(nil, assert.AnError)

		messages, err := msgUC.GetMessageHistory(ctx, roomID, 0)
		require.Error(t, err)
		assert.Nil(t, messages)
	})
}

func TestMessageUseCase_StreamMessages(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgRepo := repoMocks.NewMockMessageRepository(ctrl)
	mockAuthUC := ucMocks.NewMockAuthUseCase(ctrl)
	msgUC := NewMessageUseCase(mockMsgRepo, mockAuthUC)

	ctx := context.Background()
	roomID := "room123"

	t.Run("successful stream creation", func(t *testing.T) {
		messageChan := make(chan *entities.Message, 1)
		messageChan <- &entities.Message{ID: "msg1", Content: "Test"}
		close(messageChan)

		mockMsgRepo.EXPECT().
			StreamByRoomID(ctx, roomID).
			Return(messageChan, nil)

		stream, err := msgUC.StreamMessages(ctx, roomID)
		require.NoError(t, err)

		// Read one message from the stream
		message, ok := <-stream
		assert.True(t, ok)
		assert.Equal(t, "msg1", message.ID)

		// Channel should be closed after reading the message
		_, ok = <-stream
		assert.False(t, ok)
	})

	t.Run("stream creation error", func(t *testing.T) {
		mockMsgRepo.EXPECT().
			StreamByRoomID(ctx, roomID).
			Return(nil, assert.AnError)

		stream, err := msgUC.StreamMessages(ctx, roomID)
		require.Error(t, err)
		assert.Nil(t, stream)
	})
}

// Test the concrete implementation methods that are not in the interface
func TestMessageUseCaseConcrete_SendMessageWithAuth(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgRepo := repoMocks.NewMockMessageRepository(ctrl)
	mockAuthUC := ucMocks.NewMockAuthUseCase(ctrl)

	// Use concrete type to access methods not in interface
	msgUC := &messageUseCase{
		messageRepo: mockMsgRepo,
		authUseCase: mockAuthUC,
	}

	ctx := context.Background()
	token := "valid-token"
	content := "Hello, world!"
	roomID := "room123"
	user := &entities.User{
		ID:       "user123",
		Username: "testuser",
	}

	t.Run("successful authenticated message send", func(t *testing.T) {
		mockAuthUC.EXPECT().
			ValidateToken(ctx, token).
			Return(user, nil)

		mockMsgRepo.EXPECT().
			Create(ctx, gomock.Any()).
			DoAndReturn(func(ctx context.Context, msg *entities.Message) (*entities.Message, error) {
				assert.Equal(t, user.ID, msg.UserID)
				assert.Equal(t, user.Username, msg.Username)
				assert.Equal(t, content, msg.Content)
				assert.Equal(t, roomID, msg.RoomID)
				msg.ID = "msg123"
				return msg, nil
			})

		message, err := msgUC.SendMessageWithAuth(ctx, token, content, roomID)
		require.NoError(t, err)
		assert.Equal(t, "msg123", message.ID)
	})

	t.Run("unauthorized message send", func(t *testing.T) {
		mockAuthUC.EXPECT().
			ValidateToken(ctx, "invalid-token").
			Return(nil, assert.AnError)

		message, err := msgUC.SendMessageWithAuth(ctx, "invalid-token", content, roomID)
		require.Error(t, err)
		assert.Nil(t, message)
	})
}

func TestMessageUseCaseConcrete_GetMessageHistoryWithAuth(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMsgRepo := repoMocks.NewMockMessageRepository(ctrl)
	mockAuthUC := ucMocks.NewMockAuthUseCase(ctrl)

	// Use concrete type to access methods not in interface
	msgUC := &messageUseCase{
		messageRepo: mockMsgRepo,
		authUseCase: mockAuthUC,
	}

	ctx := context.Background()
	token := "valid-token"
	roomID := "room123"

	t.Run("successful authenticated history", func(t *testing.T) {
		expectedMessages := []*entities.Message{
			{ID: "msg1", Content: "Hello", RoomID: roomID, Timestamp: time.Now()},
		}

		mockAuthUC.EXPECT().
			ValidateToken(ctx, token).
			Return(&entities.User{ID: "user123"}, nil)

		mockMsgRepo.EXPECT().
			GetByRoomID(ctx, roomID, 50).
			Return(expectedMessages, nil)

		messages, err := msgUC.GetMessageHistoryWithAuth(ctx, token, roomID, 50)
		require.NoError(t, err)
		assert.Len(t, messages, 1)
	})

	t.Run("unauthorized history request", func(t *testing.T) {
		mockAuthUC.EXPECT().
			ValidateToken(ctx, "invalid-token").
			Return(nil, assert.AnError)

		messages, err := msgUC.GetMessageHistoryWithAuth(ctx, "invalid-token", roomID, 50)
		require.Error(t, err)
		assert.Nil(t, messages)
	})
}
