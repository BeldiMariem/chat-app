package entities

import (
	"time"
)

type User struct {
	ID           string    `firestore:"id"`
	Username     string    `firestore:"username"`
	PasswordHash string    `firestore:"password_hash"`
	CreatedAt    time.Time `firestore:"created_at"`
}

type UserCreateParams struct {
	Username string
	Password string
}

type AuthToken struct {
	Token     string    `firestore:"token"`
	UserID    string    `firestore:"user_id"`
	ExpiresAt time.Time `firestore:"expires_at"`
}
