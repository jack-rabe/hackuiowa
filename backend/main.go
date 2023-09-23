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
