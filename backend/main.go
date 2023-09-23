package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Player struct {
	ID         string
	NumCorrect int
	Conn       *websocket.Conn
}

var playersMap map[string]Player

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()

	_, msg, err := conn.ReadMessage()
	// read in username
	userId := string(msg)
	fmt.Println(msg)
	playersMap[userId] = Player{ID: userId, NumCorrect: 3, Conn: conn}
	defer delete(playersMap, userId)

	for {
		// TODO don't want to read messages, only write them
		_, connBody, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}
		for _, player := range playersMap {
			if err := player.Conn.WriteMessage(websocket.TextMessage, connBody); err != nil {
				fmt.Println(err)
				return
			}
		}
	}
}

func main() {
	playersMap = make(map[string]Player)

	router := mux.NewRouter()
	router.HandleFunc("/answer", postAnswer)
	router.HandleFunc("/question", getQuestion)
	router.HandleFunc("/createUser", createUser)
	router.HandleFunc("/ws", handleWebSocket)
	http.Handle("/", router)

	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
