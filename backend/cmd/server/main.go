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
	"chat-app/backend/internal/usecases"
	pb "chat-app/backend/proto"
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
	messageUseCase := usecases.NewMessageUseCase(messageRepo)
	chatHandler := handlers.NewChatHandler(messageUseCase)

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
