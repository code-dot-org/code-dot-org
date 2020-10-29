/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd;
export function injectExecuteCmd(fn) {
  executeCmd = fn;
}

export function pinMode(pin, mode) {
  return executeCmd(null, 'pinMode', {pin, mode});
}

export function digitalWrite(pin, value) {
  return executeCmd(null, 'digitalWrite', {pin, value});
}

export function digitalRead(pin, callback) {
  return executeCmd(null, 'digitalRead', {pin, callback});
}

export function analogWrite(pin, value) {
  return executeCmd(null, 'analogWrite', {pin, value});
}

export function analogRead(pin, callback) {
  return executeCmd(null, 'analogRead', {pin, callback});
}

export function boardConnected() {
  return executeCmd(null, 'boardConnected');
}

export function createLed(pin) {
  return executeCmd(null, 'createLed', {pin});
}

export function createButton(pin) {
  return executeCmd(null, 'createButton', {pin});
}

export function createCapacitiveTouchSensor(pin) {
  return executeCmd(null, 'createCapacitiveTouchSensor', {pin});
}

export function onBoardEvent(component, event, callback) {
  return executeCmd(null, 'onBoardEvent', {component, event, callback});
}
