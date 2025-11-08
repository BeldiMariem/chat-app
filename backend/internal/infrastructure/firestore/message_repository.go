package firestore

import (
	"context"
	"log"
	"time"

	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type MessageRepositoryImpl struct {
	client *firestore.Client
}

func NewMessageRepository(client *firestore.Client) repositories.MessageRepository {
	return &MessageRepositoryImpl{client: client}
}

func (r *MessageRepositoryImpl) Create(ctx context.Context, message *entities.Message) (*entities.Message, error) {
	messageData := map[string]interface{}{
		"user_id":   message.UserID,
		"username":  message.Username,
		"content":   message.Content,
		"room_id":   message.RoomID,
		"timestamp": firestore.ServerTimestamp,
	}

	docRef, _, err := r.client.Collection("messages").Add(ctx, messageData)
	if err != nil {
		return nil, err
	}

	message.ID = docRef.ID
	return message, nil
}

func (r *MessageRepositoryImpl) GetByRoomID(ctx context.Context, roomID string, limit int) ([]*entities.Message, error) {
	iter := r.client.Collection("messages").
		Where("room_id", "==", roomID).
		OrderBy("timestamp", firestore.Asc).
		Limit(limit).
		Documents(ctx)

	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	var messages []*entities.Message
	for _, doc := range docs {
		message, err := r.documentToMessage(doc)
		if err != nil {
			continue
		}
		messages = append(messages, message)
	}

	return messages, nil
}

func (r *MessageRepositoryImpl) StreamByRoomID(ctx context.Context, roomID string) (<-chan *entities.Message, error) {
	messageChan := make(chan *entities.Message)

	go func() {
		defer close(messageChan)

		iter := r.client.Collection("messages").
			Where("room_id", "==", roomID).
			OrderBy("timestamp", firestore.Asc).
			Snapshots(ctx)

		for {
			snap, err := iter.Next()
			if err != nil {
				if status.Code(err) == codes.Canceled {
					log.Println("Stream context canceled")
					return
				}
				log.Printf("Stream error: %v", err)
				return
			}

			if snap == nil {
				continue
			}

			for _, change := range snap.Changes {
				if change.Kind == firestore.DocumentAdded {
					message, err := r.documentToMessage(change.Doc)
					if err != nil {
						log.Printf("Error parsing document: %v", err)
						continue
					}
					messageChan <- message
				}
			}
		}
	}()

	return messageChan, nil
}

func (r *MessageRepositoryImpl) documentToMessage(doc *firestore.DocumentSnapshot) (*entities.Message, error) {
	var data map[string]interface{}
	if err := doc.DataTo(&data); err != nil {
		return nil, err
	}

	var timestamp time.Time
	if ts, ok := data["timestamp"].(time.Time); ok {
		timestamp = ts
	} else {
		timestamp = time.Now()
	}

	return &entities.Message{
		ID:        doc.Ref.ID,
		UserID:    data["user_id"].(string),
		Username:  data["username"].(string),
		Content:   data["content"].(string),
		RoomID:    data["room_id"].(string),
		Timestamp: timestamp,
	}, nil
}
