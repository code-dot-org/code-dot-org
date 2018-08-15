function startVisualizer() {
  register(function () {
    var spectrum = Dance.fft.analyze();
    var step = Game.width / spectrum.length;
    for (var i = 0; i < spectrum.length; i++) {
      var h = map(spectrum[i], 0, 255, 0, Game.height);
      rect(i * step, Game.height - h, step, Game.height);
    }
  });
}