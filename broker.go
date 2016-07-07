package main

import "log"

type Broker struct {
	Connections map[string]*Connection

	broadcast  chan string // sample for testing
	join       chan *Connection
	disconnect chan *Connection
}

func NewBroker() *Broker {
	return &Broker{
		Connections: make(map[string]*Connection),
		broadcast:   make(chan string),
		join:        make(chan *Connection),
		disconnect:  make(chan *Connection),
	}
}

func (b *Broker) Run() {
	// Dispatch
	for {
		select {
		case conn := <-b.join:
			log.Printf("Broker.Run, added new conn %s\n", conn.uuid)
			b.Connections[conn.uuid] = conn
			// XXX: If I want to loop over all Connections
			// then I should do it elsewhere
			go func(activeConn *Connection) {
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
			delete(b.Connections, conn.uuid)
			close(conn.InputChan)
			close(conn.OutputChan)
		case msg := <-b.broadcast: // Simple version for testing
			log.Printf("Broadcast: %s", msg)
		default:
		}
	}
}
