package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Connection struct {
	InputChan  chan []byte // In from client/player
	OutputChan chan []byte // Out to client/player
	errChan    chan struct{}
	ws         *websocket.Conn
	uuid       string
}

func (c *Connection) readPump() error {
	for {
		_, msg, err := c.ws.ReadMessage()
		if err == nil {
			log.Println("readPump got Message")
			c.InputChan <- msg
			// player is still active, so bump their readDeadline
			c.ws.SetReadDeadline(time.Now().Add(100 * time.Second))
		} else {
			return err
		}
	}
}

func (c *Connection) writePump() error {
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
func (c *Connection) write(payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(10 * time.Second))
	return c.ws.WriteMessage(websocket.TextMessage, payload)
}

// Creates read/write pump for ws connection via Connection
func brokerMessage(ws *websocket.Conn) *Connection {
	conn := &Connection{
		InputChan:  make(chan []byte),
		OutputChan: make(chan []byte),
		errChan:    make(chan struct{}),
		ws:         ws,
		uuid:       newUUID(),
	}

	go func() {
		err := conn.readPump()
		if err != nil {
			log.Println("Read failed, Error:", err)
			conn.errChan <- struct{}{}
		}
	}()

	go func() {
		err := conn.writePump()
		if err != nil {
			log.Println("Write failed, Error:", err)
			conn.errChan <- struct{}{}
		}
	}()

	return conn
}
