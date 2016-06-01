(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.log("Main");

var Game = function Game() {
  _classCallCheck(this, Game);

  this.conn = new GameConnection("localhost:9090");
  this.sendControl = document.getElementById("send");
};

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

runningGame.sendControl.addEventListener("click", function () {
  console.log("Send!");
  var value = document.getElementById("msg").value;
  document.getElementById("msg").value = "";
  runningGame.conn.wsConn.send(value);
});

},{}]},{},[1])