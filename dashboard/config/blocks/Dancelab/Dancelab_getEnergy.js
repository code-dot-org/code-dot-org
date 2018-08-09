function getEnergy(range) {
  if (range == "low") {
    return Dance.fft.getEnergy(20, 200);
  } else if (range == "mid") {
    return Dance.fft.getEnergy(400, 2600);
  } else {
    return Dance.fft.getEnergy(2700, 4000);
  }
}