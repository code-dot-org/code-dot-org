function whenPeak(range, event) {
  /*
  // This approach only allows one event handler per beat detector
  Dance.fft.onPeak(range, event);
  */
  inputEvents.push({type: Dance.fft.isPeak, event: event, param: range});
}