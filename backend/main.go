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

type PostAnswerRequest = struct {
	UserID    string   `json:"userId"`
	Responses []string `json:"responses"`
}

// type PostAnswerResponse = struct {
// 	HasWon boolean  `json:"hasWon"`
// 	Input  []string `json:"input"`
// }

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
	fmt.Println(req)

	fmt.Println(string(requestBody))
	io.WriteString(w, "This is my website!\n")
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

func main() {
	http.HandleFunc("/answer", postAnswer)
	http.HandleFunc("/question", getQuestion)

	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
