package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// TODO rn donald has to send this twice, should we refactor the other check?
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()

	// read in username
	_, msg, err := conn.ReadMessage()
	userId := string(msg)
	fmt.Println(string(msg))
	playersMap[userId] = Player{ID: userId, NumCorrect: 3, Conn: conn}
	defer delete(playersMap, userId)
	fmt.Println(playersMap)

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
