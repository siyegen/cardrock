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

func (b *Broker) Run() {
	// Dispatch
	for {
		select {
		case conn := <-b.join:
			log.Printf("Broker.Run, added new conn %s\n", conn.uuid)
			b.Clients[conn.uuid] = conn

			go func(activeConn *ClientConn) {
				for {
					select {
					// XXX: Currently this causes it to spam empty messages
					// when closed.
					case msg, ok := <-activeConn.InputChan:
						if !ok {
							return
						}
						log.Printf("[%s]sent: %s\n", activeConn.uuid, msg)
						b.broadcast <- string(msg)
					}
				}
			}(conn)
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
