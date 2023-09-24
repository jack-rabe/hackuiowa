package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Player struct {
	ID         string
	NumCorrect int
	Conn       *websocket.Conn
}

var playersMap map[string]Player

func connectToMongo() {
	mongoUserName, userNameFound := os.LookupEnv("MONGO_USER")
	mongoPassword, passwordFound := os.LookupEnv("MONGO_PASSWORD")
	if !userNameFound || !passwordFound {
		panic("username or password not found")
	}
	uri := fmt.Sprintf("mongodb+srv://%s:%s@cluster0.29nf6.mongodb.net/?retryWrites=true&w=majority", mongoUserName, mongoPassword)
	fmt.Println(uri)

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
	// Create a new client and connect to the server
	client, err := mongo.Connect(context.TODO(), opts)
	if err != nil {
		panic(err)
	}

	// db := client.Database("x")
	// collection := db.Collection("y")
	// collection.Find()

	defer func() {
		if err = client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	// Send a ping to confirm a successful connection
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Err(); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")
}

func main() {
	godotenv.Load()
	playersMap = make(map[string]Player)

	// connectToMongo()

	router := mux.NewRouter()
	router.HandleFunc("/answer", postAnswer)
	router.HandleFunc("/question", getQuestion)
	router.HandleFunc("/createUser", createUser)
	router.HandleFunc("/ws", handleWebSocket)
	http.Handle("/", router)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})
	handler := c.Handler(router)
	err := http.ListenAndServe(":3333", handler)
	if err != nil {
		fmt.Println(err)
		return
	}
}
