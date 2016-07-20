package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type ClientConn struct {
	InputChan  chan []byte // In from client/player
	OutputChan chan []byte // Out to client/player
	errChan    chan struct{}
	ws         *websocket.Conn
	uuid       string
}

func (c *ClientConn) readPump() error {
	for {
		_, msg, err := c.ws.ReadMessage()
		if err == nil {
			c.InputChan <- msg
			// player is still active, so bump their readDeadline
			c.ws.SetReadDeadline(time.Now().Add(100 * time.Second))
		} else {
			return err
		}
	}
}

func (c *ClientConn) writePump() error {
	for {
		select {
		case message, ok := <-c.OutputChan:
			if ok {
				err := c.write(message)
				if err != nil {
					return err
				}
			} else {
				return nil
			}
		}
	}
}

// Wrap to always send Timestamp
func (c *ClientConn) write(payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(10 * time.Second))
	return c.ws.WriteMessage(websocket.TextMessage, payload)
}

func handleNewClient(ws *websocket.Conn) *ClientConn {
	uuid := newUUID()
	response := []byte(`{"cmd":"online", "session":` + uuid + `}`)

	client := &ClientConn{
		InputChan:  make(chan []byte),
		OutputChan: make(chan []byte),
		errChan:    make(chan struct{}),
		ws:         ws,
		uuid:       uuid,
	}
	go func() {
		err := client.readPump()
		if err != nil {
			log.Println("Read failed, Error:", err)
			client.errChan <- struct{}{}
		}
	}()

	go func() {
		err := client.writePump()
		if err != nil {
			log.Println("Write failed, Error:", err)
			client.errChan <- struct{}{}
		}
	}()

	// Initial message
	client.OutputChan <- response

	return client
}
