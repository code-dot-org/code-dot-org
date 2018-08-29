function whenKey(key, event) {
  inputEvents.push({type: keyWentDown, event: event, param: key});
}