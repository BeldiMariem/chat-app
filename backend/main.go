package main

import (
	"context"
	"log"
	"net"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
	"google.golang.org/grpc"

	pb "chat-app/backend/proto"
)

type server struct {
	pb.UnimplementedChatServiceServer
	firestoreClient *firestore.Client
}

func (s *server) SendMessage(ctx context.Context, req *pb.MessageRequest) (*pb.MessageResponse, error) {
	// Create message data with proper Firestore timestamp
	messageData := map[string]interface{}{
		"user_id":   req.GetUserId(),
		"content":   req.GetContent(),
		"room_id":   req.GetRoomId(),
		"timestamp": firestore.ServerTimestamp,
	}

	log.Printf("Storing message in Firestore: %+v", messageData)

	// Add document to Firestore
	docRef, _, err := s.firestoreClient.Collection("messages").Add(ctx, messageData)
	if err != nil {
		log.Printf("Error storing message: %v", err)
		return nil, err
	}

	log.Printf("Message stored with ID: %s", docRef.ID)

	// Return response
	return &pb.MessageResponse{
		MessageId: docRef.ID,
		UserId:    req.GetUserId(),
		Content:   req.GetContent(),
		RoomId:    req.GetRoomId(),
		Timestamp: time.Now().Format(time.RFC3339),
	}, nil
}

func (s *server) StreamMessages(req *pb.StreamRequest, stream pb.ChatService_StreamMessagesServer) error {
	ctx := stream.Context()

	log.Printf("Starting message stream for room: %s", req.GetRoomId())

	// Listen for real-time updates from Firestore
	iter := s.firestoreClient.Collection("messages").
		Where("room_id", "==", req.GetRoomId()).
		OrderBy("timestamp", firestore.Asc).
		Snapshots(ctx)

	for {
		snap, err := iter.Next()
		if err != nil {
			log.Printf("Stream error: %v", err)
			return err
		}

		if snap == nil {
			continue
		}

		for _, change := range snap.Changes {
			if change.Kind == firestore.DocumentAdded {
				doc := change.Doc
				var data map[string]interface{}
				if err := doc.DataTo(&data); err != nil {
					log.Printf("Error parsing document: %v", err)
					continue
				}

				// Extract timestamp properly
				var timestampStr string
				if ts, ok := data["timestamp"].(time.Time); ok {
					timestampStr = ts.Format(time.RFC3339)
				} else {
					timestampStr = time.Now().Format(time.RFC3339)
				}

				// Convert to gRPC response
				resp := &pb.MessageResponse{
					MessageId: doc.Ref.ID,
					UserId:    data["user_id"].(string),
					Content:   data["content"].(string),
					RoomId:    data["room_id"].(string),
					Timestamp: timestampStr,
				}

				log.Printf("Sending message to stream: %s", resp.GetContent())

				if err := stream.Send(resp); err != nil {
					log.Printf("Stream send error: %v", err)
					return err
				}
			}
		}
	}
}

func main() {
	// Firebase setup
	ctx := context.Background()

	// Use service account key file
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

	// gRPC server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterChatServiceServer(s, &server{firestoreClient: client})

	log.Printf("gRPC server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
