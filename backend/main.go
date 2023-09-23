package main

import (
	"encoding/json"
	"fmt"
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
	io.WriteString(w, string(responseBody))
}

func main() {
	http.HandleFunc("/question", getQuestion)

	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}