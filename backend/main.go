package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/answer", postAnswer)
	router.HandleFunc("/question", getQuestion)
	http.Handle("/", router)

	err := http.ListenAndServe(":3333", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
