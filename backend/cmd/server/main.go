package main

import (
	"context"
	"log"
	"net/http"
	"os"

	firebase "firebase.google.com/go"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/api/option"
	"google.golang.org/grpc"

	infraFirestore "chat-app/backend/internal/infrastructure/firestore"
	"chat-app/backend/internal/interfaces/grpc/handlers"
	pb "chat-app/backend/internal/interfaces/grpc/proto"
	"chat-app/backend/internal/usecases"
)

func main() {
	ctx := context.Background()

	// Use Render's PORT environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

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

	// Create gRPC server
	grpcServer := grpc.NewServer()
	pb.RegisterChatServiceServer(grpcServer, chatHandler)

	// Wrap gRPC server with gRPC-Web
	wrappedGrpc := grpcweb.WrapServer(grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool {
			// Allow all origins in production
			return true
		}),
		grpcweb.WithAllowedRequestHeaders([]string{"*"}),
	)

	// Create HTTP handler that can handle gRPC-Web and HTTP/2
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) {
			wrappedGrpc.ServeHTTP(w, r)
			return
		}
		// Fallback for other HTTP requests
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Chat App gRPC Server is running"))
	})

	// Create HTTP server with h2c support for HTTP/2 without TLS
	httpServer := &http.Server{
		Addr:    ":" + port,
		Handler: h2c.NewHandler(handler, &http2.Server{}),
	}

	log.Printf("gRPC-Web server listening on port %s", port)
	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
