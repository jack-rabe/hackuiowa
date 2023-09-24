package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

type PostAnswerRequest = struct {
	UserID    string   `json:"userId"`
	Responses []string `json:"responses"`
}

type PostAnswerResponse = struct {
	HasWon          bool  `json:"hasWon"`
	MissedQuestions []int `json:"missedQuestions"`
}

type X = struct {
	Day      int      `json:"day"`
	Expected []string `json:"expected"`
}

func postAnswer(w http.ResponseWriter, r *http.Request) {
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

	db, client := connectToMongo()
	collection := db.Collection("answers")
	answerObject := collection.FindOne(context.Background(), bson.M{})
	var answerResult X
	err = answerObject.Decode(&answerResult)
	if err != nil {
		panic(err)
	}
	fmt.Println(answerResult)
	missedQuestions := make([]int, 0)
	for idx, expected := range answerResult.Expected {
		fmt.Println(req.Responses[idx], expected)
		if expected != req.Responses[idx] {
			missedQuestions = append(missedQuestions, idx)
		}

	}
	answerReponse := PostAnswerResponse{HasWon: len(missedQuestions) == 0, MissedQuestions: missedQuestions}
	responseBody, err := json.Marshal(answerReponse)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err = client.Disconnect(context.Background()); err != nil {
			panic(err)
		}
	}()

	io.WriteString(w, string(responseBody))
}
