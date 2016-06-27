package main

import (
	"crypto/md5"
	"crypto/rand"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func newUUID() string {
	h := md5.New()
	b := make([]byte, 16)
	rand.Read(b)
	io.WriteString(h, string(b))
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

var (
	allConnections       = make(map[string]*Connection)
	inGameConnections    = make(map[string]*Connection)
	searchingConnections = make(map[string]*Connection)
	ticker               = time.NewTicker(5 * time.Second)
)

func serveWS(res http.ResponseWriter, req *http.Request) {
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("Error upgrading to websocket", err)
		return
	}
	defer ws.Close()

	conn := broker(ws)
	allConnections[conn.uuid] = conn

	for {
		select {
		case msg := <-conn.InputChan:
			log.Printf("recv: %s\n", msg)
		case <-ticker.C:
			conn.write([]byte(`{"cmd":"tick_tock"}`))
		}
	}
}

func main() {
	fmt.Println("Yo Yo")
	addr := "localhost:9090"

	http.HandleFunc("/ws", serveWS)
	log.Fatal(http.ListenAndServe(addr, nil))
}
