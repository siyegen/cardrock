package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type App struct {
	broker *Broker
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func (app *App) simpleStats(res http.ResponseWriter, req *http.Request) {
	activeClients := len(app.broker.Clients)
	log.Println("ccccc: ", activeClients)
	res.WriteHeader(200)
	res.Write([]byte(`Clients: ` + string(activeClients)))
}

func (app *App) serveWS(res http.ResponseWriter, req *http.Request) {
	ws, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("Error upgrading to websocket", err)
		return
	}
	defer ws.Close()

	conn := handleNewClient(ws)
	app.broker.join <- conn
	log.Printf("%s: Waiting for close", conn.uuid)
	<-conn.errChan
	log.Println("Conn closed or error")
	app.broker.disconnect <- conn
}

func main() {
	fmt.Println("Yo Yo")
	addr := "localhost:9090"
	app := &App{broker: NewBroker()}

	go app.broker.Run()
	http.HandleFunc("/ws", app.serveWS)
	http.HandleFunc("/stats", app.simpleStats)
	log.Fatal(http.ListenAndServe(addr, nil))
}
