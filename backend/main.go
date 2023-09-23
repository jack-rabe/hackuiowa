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

var playersMap map[int]Player
var tmpPlayerNum *int

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	*tmpPlayerNum++
	playerNum := *tmpPlayerNum
	conn, err := upgrader.Upgrade(w, r, nil)
	playersMap[playerNum] = Player{ID: "jack", NumCorrect: 3, Conn: conn}
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()
	defer delete(playersMap, playerNum)

	for {
		_, requestBody, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}
		for _, player := range playersMap {
			if err := player.Conn.WriteMessage(websocket.TextMessage, requestBody); err != nil {
				fmt.Println(err)
				return
			}
		}
	}
}

func main() {
	tmpPlayerNum = new(int)
	playersMap = make(map[int]Player)

	router := mux.NewRouter()
	router.HandleFunc("/answer", postAnswer)
	router.HandleFunc("/question", getQuestion)
	router.HandleFunc("/ws", handleWebSocket)
	http.Handle("/", router)

	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
