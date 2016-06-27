(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.log("Main");

function simpleUUID() {
  var len = 10;
  var uuid = [];
  for (var i = 0; i < len; i++) {
    uuid.push(Math.floor(97 + Math.random() * (122 - 97)));
  }
  console.log("moo uuid");
  return String.fromCharCode.apply(String, uuid);
}

var Game = (function () {
  function Game() {
    _classCallCheck(this, Game);

    this.conn = new GameConnection("localhost:9090");
    this.startButton = document.getElementById("start");
    this.playerID = simpleUUID();

    this.searchTimer = 0;
    this.refreshTimeMS = 10 * 1000; // x seconds
    this.state = "NEW";

    // Binding, etc
    this.loop = this.loop.bind(this);
  }

  _createClass(Game, [{
    key: "loop",
    value: function loop(dt, first) {
      // For now all state logic here
      if (this.state == "SEARCHING") {
        if (dt - this.searchTimer >= this.refreshTimeMS) {
          console.log("Refreshing search");
          this.searchTimer = dt;
        }
      }
      requestAnimationFrame(this.loop);
    }
  }, {
    key: "start",
    value: function start() {
      this.loop(performance.now(), true);
    }
  }, {
    key: "begin",
    value: function begin() {
      // Part of searching for game
      if (this.state != "NEW") return;
      console.log("uuid", runningGame.playerID);
      this.state = "SEARCHING";
      this.searchTimer = performance.now();
    }
  }]);

  return Game;
})();

var GameConnection = (function () {
  function GameConnection(addr) {
    _classCallCheck(this, GameConnection);

    this.wsConn = new WebSocket("ws://" + addr + "/ws");
    this.wsConn.onclose = this.onclose;
    this.wsConn.onmessage = this.onMessage;
  }

  _createClass(GameConnection, [{
    key: "onClose",
    value: function onClose(evt) {
      console.log("socket closed");
    }
  }, {
    key: "onMessage",
    value: function onMessage(evt) {
      console.log("msg", evt.data);
      console.info(evt);
    }
  }, {
    key: "onOpen",
    value: function onOpen() {}
  }]);

  return GameConnection;
})();

var runningGame = new Game();
// Eventually should wait for connection to be ready
runningGame.start();

runningGame.startButton.addEventListener("click", function () {
  return runningGame.begin();
});

},{}]},{},[1])