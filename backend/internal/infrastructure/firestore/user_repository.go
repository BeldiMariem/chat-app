package firestore

import (
	"context"
	"fmt"
	"time"

	"chat-app/backend/internal/domain/entities"
	"chat-app/backend/internal/domain/repositories"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

type UserRepositoryImpl struct {
	client *firestore.Client
}

func NewUserRepository(client *firestore.Client) repositories.UserRepository {
	return &UserRepositoryImpl{client: client}
}

func (r *UserRepositoryImpl) CreateUser(ctx context.Context, user *entities.User) error {
	iter := r.client.Collection("users").Where("username", "==", user.Username).Documents(ctx)
	_, err := iter.Next()
	if err != iterator.Done {
		return fmt.Errorf("username already exists")
	}

	_, err = r.client.Collection("users").Doc(user.ID).Set(ctx, map[string]interface{}{
		"id":            user.ID,
		"username":      user.Username,
		"password_hash": user.PasswordHash,
		"created_at":    user.CreatedAt,
	})
	return err
}

func (r *UserRepositoryImpl) GetUserByUsername(ctx context.Context, username string) (*entities.User, error) {
	iter := r.client.Collection("users").Where("username", "==", username).Documents(ctx)
	doc, err := iter.Next()
	if err == iterator.Done {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	var user entities.User
	if err := doc.DataTo(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepositoryImpl) GetUserByID(ctx context.Context, userID string) (*entities.User, error) {
	doc, err := r.client.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		return nil, err
	}

	var user entities.User
	if err := doc.DataTo(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepositoryImpl) StoreToken(ctx context.Context, token *entities.AuthToken) error {
	_, err := r.client.Collection("tokens").Doc(token.Token).Set(ctx, map[string]interface{}{
		"token":      token.Token,
		"user_id":    token.UserID,
		"expires_at": token.ExpiresAt,
	})
	return err
}

func (r *UserRepositoryImpl) ValidateToken(ctx context.Context, token string) (*entities.AuthToken, error) {
	doc, err := r.client.Collection("tokens").Doc(token).Get(ctx)
	if err != nil {
		return nil, err
	}

	var authToken entities.AuthToken
	if err := doc.DataTo(&authToken); err != nil {
		return nil, err
	}

	if time.Now().After(authToken.ExpiresAt) {
		r.client.Collection("tokens").Doc(token).Delete(ctx)
		return nil, fmt.Errorf("token expired")
	}

	return &authToken, nil
}

func (r *UserRepositoryImpl) DeleteToken(ctx context.Context, token string) error {
	_, err := r.client.Collection("tokens").Doc(token).Delete(ctx)
	return err
}
