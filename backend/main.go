package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type QuestionResponse = struct {
	Question string   `json:"question"`
	Inputs   []string `json:"inputs"`
}

func getQuestion(w http.ResponseWriter, r *http.Request) {
	var question QuestionResponse
	question.Question = "what is the smallest element in this array"
	question.Inputs = []string{"[1], [1, 2]"}
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
