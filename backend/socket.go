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
	fmt.Println(playersMap)
	p, ok := playersMap[userId]
	if ok && p.Conn != nil {
		for _, player := range playersMap {
			if player.Conn == nil || player.ID == userId {
				continue
			}
			if err = player.Conn.WriteMessage(websocket.TextMessage, []byte(userId+" joined")); err != nil {
				fmt.Println(err)
				return
			}
		}
	}
	playersMap[userId] = Player{ID: userId, NumCorrect: 0, Conn: conn}
	defer delete(playersMap, userId)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}
	}
}
