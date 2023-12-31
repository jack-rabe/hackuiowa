package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type CreateUserRequest = struct {
	UserID string `json:"userId"`
}

func createUser(w http.ResponseWriter, r *http.Request) {
	requestBody := make([]byte, 1110)
	num, err := r.Body.Read(requestBody)
	requestBody = requestBody[:num]
	if err != nil && err != io.EOF {
		fmt.Println("err reading request body")
		panic(err)
	}

	var req CreateUserRequest
	err = json.Unmarshal(requestBody, &req)
	if err != nil {
		panic(err)
	}
	isDuplicate := false
	for _, player := range playersMap {
		if req.UserID == player.ID {
			isDuplicate = true
		}
	}
	playersMap[req.UserID] = Player{ID: req.UserID, NumCorrect: 0}

	if isDuplicate {
		w.WriteHeader(400)
	} else {
		w.WriteHeader(http.StatusCreated)
	}
}

type NicePlayer struct {
	ID         string `json:"userId"`
	NumCorrect int    `json:"numCorrect"`
}

func getUsers(w http.ResponseWriter, r *http.Request) {

	players := make([]NicePlayer, 0)
	for _, player := range playersMap {
		players = append(players, NicePlayer{ID: player.ID, NumCorrect: player.NumCorrect})
	}
	res, err := json.Marshal(players)
	if err != nil {
		panic(err)
	}
	io.WriteString(w, string(res))
}
