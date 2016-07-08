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
    // Get from server
    this.playerID = simpleUUID();
    this.host = "localhost";
    this.login();

    // this.conn = new GameConnection(``);
    this.conn = new WebSocket(`ws://${this.host}:9090/ws`);
    this.conn.onclose = this.onclose;
    this.conn.onmessage = this.onMessage;

    this.startButton = document.getElementById("start");
    this.searchTimer = 0;
    this.refreshTimeMS = 2*1000; // x seconds
    this.state = "NEW";

    // Binding, etc
    this.loop = this.loop.bind(this);
  }
  login() {
    // $.ajax(``).done(msg => {
    //
    // });
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
  onClose(evt) {
    console.log("socket closed");
  }
  onMessage(evt) {
    console.log("msg", evt.data);
    let msg = JSON.parse(evt.data);
    if(msg["cmd"] === undefined) {
      console.error("Bad message", evt);
      return;
    }
    switch (msg.cmd) {
      case "joined":
        console.info("new connection");
        this.serverID = msg['session'];
        break;
      default:
        console.info("No match", msg.CMD);
    }
  }
  onOpen() {}
}

let runningGame = new Game();
// Eventually should wait for connection to be ready
runningGame.start();

runningGame.startButton.addEventListener("click",
  () => runningGame.begin());
