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

export function timedLoop(ms, callback) {
  return executeCmd(null, 'timedLoop', {ms, callback});
}

export function onBoardEvent(component, event, callback) {
  return executeCmd(null, 'onBoardEvent', {component, event, callback});
}
