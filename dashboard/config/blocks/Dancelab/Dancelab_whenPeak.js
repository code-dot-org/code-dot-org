function whenPeak(range, event) {
  inputEvents.push({type: Dance.fft.isPeak, event: event, params: beat_detectors[range]});
}