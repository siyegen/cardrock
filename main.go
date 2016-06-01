package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func serveWS(res http.ResponseWriter, req *http.Request) {
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("Error upgrading to websocket", err)
		return
	}
	defer ws.Close()

	ws.WriteMessage(websocket.TextMessage, []byte(`Message start`))

	for {
		mt, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = ws.WriteMessage(mt, message)
		if err != nil {
			log.Println("write error:", err)
			break
		}
	}
}

func main() {
	fmt.Println("Yo Yo")
	addr := "localhost:9090"

	http.HandleFunc("/ws", serveWS)
	log.Fatal(http.ListenAndServe(addr, nil))
}
