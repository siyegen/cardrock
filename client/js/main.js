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

    this.searchTimer = 0;
    this.refreshTimeMS = 2*1000; // x seconds
    this.state = "NEW";

    // Binding, etc
    this.loop = this.loop.bind(this);
  }
  loop(dt, first) {
    // For now all state logic here
    if (this.state == "SEARCHING") {
      if (dt - this.searchTimer >= this.refreshTimeMS) {
        console.log("Refreshing search");
        this.searchTimer = dt;
        this.conn.wsConn.send(JSON.stringify({uuid: "N/A",
          state: "SEARCHING", ts: performance.now()}))
      }
    }
    requestAnimationFrame(this.loop);
  }
  start() {
    this.loop(performance.now(), true);
  }
  begin() { // Part of searching for game
    if (this.state != "NEW") return;
    console.log("uuid", runningGame.playerID);
    this.state = "SEARCHING";
    this.searchTimer = performance.now();
    window.ttc = this.conn.wsConn;
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
// Eventually should wait for connection to be ready
runningGame.start();

runningGame.startButton.addEventListener("click",
  () => runningGame.begin());
