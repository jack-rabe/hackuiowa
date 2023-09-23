package main

import (
	"encoding/json"
	"io"
	"net/http"
)

type QuestionResponse = struct {
	Question    string   `json:"question"`
	Inputs      []string `json:"inputs"`
	SampleInput string   `json:"sampleInput"`
	Solution    string   `json:"solution"`
	Explanation string   `json:"explanation"`
}

func getQuestion(w http.ResponseWriter, r *http.Request) {
	question := QuestionResponse{
		Question:    "what is the smallest element in this array",
		Inputs:      []string{"[1], [1,2]"},
		Solution:    "this is a solution",
		SampleInput: "[3,2,1]",
		Explanation: "this is an explanation"}

	responseBody, err := json.Marshal(question)
	if err != nil {
		panic(err)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	io.WriteString(w, string(responseBody))
}
