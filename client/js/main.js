console.log("Main");

class Game {
  constructor() {
    this.conn = new GameConnection("localhost:9090");
    this.sendControl = document.getElementById("send");
  }
}

class GameConnection {
  constructor(addr) {
    this.wsConn = new WebSocket(`ws://${addr}/ws`);
    this.wsConn.onclose = this.onclose;
    this.wsConn.onmessage = this.onMessage;
  }
  onClose(evt) {
    console.log("socket closed");
  }
  onMessage(evt) {
    console.log("msg", evt.data);
    console.info(evt);
  }
  onOpen() {}
}

let runningGame = new Game();

runningGame.sendControl.addEventListener("click", () => {
  console.log("Send!");
  let value = document.getElementById("msg").value;
  document.getElementById("msg").value = "";
  runningGame.conn.wsConn.send(value);
});
