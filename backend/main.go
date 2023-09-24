package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Player struct {
	ID         string
	NumCorrect int
	Conn       *websocket.Conn
}

var playersMap map[string]Player

func connectToMongo() (*mongo.Database, *mongo.Client) {
	mongoUserName, userNameFound := os.LookupEnv("MONGO_USER")
	mongoPassword, passwordFound := os.LookupEnv("MONGO_PASSWORD")
	environment := os.Getenv("ENV")
	if (!userNameFound || !passwordFound) && environment != "LOCAL" {
		panic("username or password not found")
	}
	uri := fmt.Sprintf("mongodb+srv://%s:%s@cluster0.29nf6.mongodb.net/?retryWrites=true&w=majority", mongoUserName, mongoPassword)
	if environment == "LOCAL" {
		uri = "mongodb://localhost:27017"
	}
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
	client, err := mongo.Connect(context.Background(), opts)
	if err != nil {
		panic(err)
	}

	db := client.Database("test")
	return db, client
}

func getQuestionNumberForDay() int {
	questionMap := map[int]int{24: 7, 25: 1, 26: 0, 27: 2, 28: 3, 29: 4, 30: 5, 1: 6}
	day := time.Now().Day()
	return questionMap[day]
}

func main() {
	godotenv.Load()
	playersMap = make(map[string]Player)

	router := mux.NewRouter()
	router.HandleFunc("/answer", postAnswer)
	router.HandleFunc("/question", getQuestion)
	router.HandleFunc("/createUser", createUser)
	router.HandleFunc("/users", getUsers)
	router.HandleFunc("/ws", handleWebSocket)
	http.Handle("/", router)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})
	handler := c.Handler(router)

	    certFile := "privkey.pem"
	    keyFile := "fullchain.pem"
	    err := http.ListenAndServeTLS(":443", keyFile, certFile , handler)
	if err != nil {
		fmt.Println(err)
		return
	}
}
