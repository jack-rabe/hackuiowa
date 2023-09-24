package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

type QuestionResponse = struct {
	Question    string   `json:"question"`
	Inputs      []string `json:"inputs"`
	SampleInput string   `json:"sampleInput"`
	Solution    string   `json:"solution"`
	Explanation string   `json:"explanation"`
}

func getQuestion(w http.ResponseWriter, r *http.Request) {
	db, client := connectToMongo()
	collection := db.Collection("questions")
	questionObject := collection.FindOne(context.Background(), bson.M{})
	var questionResult QuestionResponse
	err := questionObject.Decode(&questionResult)
	if err != nil {
		panic(err)
	}
	responseBody, err := json.Marshal(questionResult)
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
