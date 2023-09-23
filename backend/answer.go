package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type PostAnswerRequest = struct {
	UserID    string   `json:"userId"`
	Responses []string `json:"responses"`
}

type PostAnswerResponse = struct {
	HasWon          bool  `json:"hasWon"`
	MissedQuestions []int `json:"missedQuestions"`
}

func postAnswer(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got post request\n")
	requestBody := make([]byte, 1110)
	num, err := r.Body.Read(requestBody)
	requestBody = requestBody[:num]
	if err != nil && err != io.EOF {
		fmt.Println("err reading request body")
		panic(err)
	}

	var req PostAnswerRequest
	err = json.Unmarshal(requestBody, &req)
	if err != nil {
		panic(err)
	}

	answerReponse := PostAnswerResponse{HasWon: false, MissedQuestions: []int{1, 2}}
	responseBody, err := json.Marshal(answerReponse)
	if err != nil {
		panic(err)
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	io.WriteString(w, string(responseBody))
}