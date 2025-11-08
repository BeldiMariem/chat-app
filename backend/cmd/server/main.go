package main

import (
	"context"
	"log"
	"net"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
	"google.golang.org/grpc"

	infraFirestore "chat-app/backend/internal/infrastructure/firestore"
	"chat-app/backend/internal/interfaces/grpc/handlers"
	pb "chat-app/backend/internal/interfaces/grpc/proto"
	"chat-app/backend/internal/usecases"
)

func main() {
	ctx := context.Background()

	opt := option.WithCredentialsFile("firebase-service-account.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error initializing Firestore: %v", err)
	}
	defer client.Close()

	log.Println("Firestore client initialized successfully")

	messageRepo := infraFirestore.NewMessageRepository(client)
	userRepo := infraFirestore.NewUserRepository(client)

	authUseCase := usecases.NewAuthUseCase(userRepo)
	messageUseCase := usecases.NewMessageUseCase(messageRepo, authUseCase)

	chatHandler := handlers.NewChatHandler(messageUseCase, authUseCase)

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterChatServiceServer(s, chatHandler)

	log.Printf("gRPC server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
