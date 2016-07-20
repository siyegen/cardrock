package main

import "log"

type Broker struct {
	Clients map[string]*ClientConn

	broadcast  chan string // sample for testing
	join       chan *ClientConn
	disconnect chan *ClientConn
}

func NewBroker() *Broker {
	return &Broker{
		Clients:    make(map[string]*ClientConn),
		broadcast:  make(chan string),
		join:       make(chan *ClientConn),
		disconnect: make(chan *ClientConn),
	}
}

func (b *Broker) addClient(client *ClientConn) {
	for {
		select {
		// Get message, handle format, pass to controller...?
		case msg, ok := <-client.InputChan:
			if !ok {
				return
			}
			log.Printf("[%s]sent: %s\n", client.uuid, msg)
			b.broadcast <- string(msg)
		}
	}
}

func (b *Broker) Run() {
	for {
		select {
		case conn := <-b.join:
			log.Printf("Broker.Run, added new conn %s\n", conn.uuid)
			b.Clients[conn.uuid] = conn
			go b.addClient(conn)
		case conn := <-b.disconnect:
			log.Println("Broker.Run, disconnected conn")
			delete(b.Clients, conn.uuid)
			close(conn.InputChan)
			close(conn.OutputChan)
		case msg := <-b.broadcast: // Simple version for testing
			log.Printf("Broadcast: %s", msg)
		default:
		}
	}
}

type MainController struct {
	State       string
	Client      *ClientConn
	ConnectedTo *ClientConn
}

var NilClientConn = &ClientConn{}
