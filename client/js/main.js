console.log("Main");

function simpleUUID() {
  let len = 10;
  let uuid = [];
  for (var i = 0; i < len; i++) {
    uuid.push(Math.floor(97+Math.random()*(122-97)))
  }
  console.log("moo uuid");
  return String.fromCharCode(...uuid);
}

class Game {
  constructor() {
    this.conn = new GameConnection("localhost:9090");
    this.startButton = document.getElementById("start");
    this.playerID = simpleUUID();

    this.state = "NEW";
  }
  loop() {

  }
  start() {
    if (this.state != "NEW") return;
    console.log("uuid", runningGame.playerID);
    this.state = "START";
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

runningGame.startButton.addEventListener("click", () => {

});
