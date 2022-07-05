"use strict";
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:
function $Promise(executor) {
  this._state = "pending";
  this._data = undefined;
  this._handlerGroups = [];
  if (typeof executor !== "function") {
    throw new TypeError("executor not is a function");
  }
  executor(this._internalResolve.bind(this), this._internalReject.bind(this));
}

$Promise.prototype._internalResolve = function (data) {
  if (this._state === "pending") {
    this._state = "fulfilled";
    this._value = data;
    this._callHandlers();
  }
};
$Promise.prototype._internalReject = function (reason) {
  if (this._state === "pending") {
    this._state = "rejected";
    this._value = reason;
    this._callHandlers();
  }
};

$Promise.prototype.then = function (successCb, errorCb) {
  if (typeof successCb !== "function") {
    successCb = false;
  }
  if (typeof errorCb !== "function") {
    errorCb = false;
  }

  const downstreamPromise = new $Promise(function () {});

  this._handlerGroups.push({
    successCb,
    errorCb,
    downstreamPromise,
  });
  if (this._state !== "pending") {
    this._callHandlers();
  }
  return downstreamPromise;
};

$Promise.prototype._callHandlers = function () {
  while (this._handlerGroups.length) {
    var handler = this._handlerGroups.shift();
    if (this._state === "fulfilled") {
      if (!handler.successCb) {
        handler.downstreamPromise._internalResolve(this._value);
      } else {
        try {
          // intenta hacer esto
          const result = handler.successCb(this._value);
          // si es una instancia de promesa
          if (result instanceof $Promise) {
            // result es una promesa
            result.then(
              (value) => {
                handler.downstreamPromise._internalResolve(value);
              },
              (err) => {
                handler.downstreamPromise._internalReject(err);
              }
            );
          } else {
            //result es un valor
            handler.downstreamPromise._internalResolve(result);
          }
          //si tira error nos permite tomarlo y hacer algo con ese error
        } catch (error) {
          //hacemos esto con el error
          handler.downstreamPromise._internalReject(error);
        }
      }
    } else {
      if (!handler.errorCb) {
        handler.downstreamPromise._internalReject(this._value);
      } else {
        try {
          const result = handler.errorCb(this._value);
          if (result instanceof $Promise) {
            result.then(
              (value) => {
                handler.downstreamPromise._internalResolve(value);
              },
              (err) => {
                handler.downstreamPromise._internalReject(err);
              }
            );
          } else {
            handler.downstreamPromise._internalResolve(result);
          }
        } catch (error) {
          handler.downstreamPromise._internalReject(error);
        }
      }
    }
  }
};

$Promise.prototype.catch = function (errorCb) {
  this.then(null, errorCb);
};

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
