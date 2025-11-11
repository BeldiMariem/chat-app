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

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-grpc-web, x-user-agent")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	ctx := context.Background()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8078"
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

	grpcServer := grpc.NewServer()
	pb.RegisterChatServiceServer(grpcServer, chatHandler)

	wrappedGrpc := grpcweb.WrapServer(grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool {
			return true
		}),
		grpcweb.WithAllowedRequestHeaders([]string{"*"}),
	)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) {
			wrappedGrpc.ServeHTTP(w, r)
			return
		}

		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Chat App gRPC Server is running"))
	})

	corsHandler := enableCORS(handler)

	httpServer := &http.Server{
		Addr:    "0.0.0.0:" + port,
		Handler: h2c.NewHandler(corsHandler, &http2.Server{}),
	}

	log.Printf("Server listening on 0.0.0.0:%s", port)
	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
