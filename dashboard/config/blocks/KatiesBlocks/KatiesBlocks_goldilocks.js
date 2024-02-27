function goldilocks(condition, costume, callback) {
  var count = countByAnimation({costume: costume});
  switch(condition) {
    case "gas":
      if(count > 212) {
        callback();
      }
      break;
    case "liquid":
      if(count >=32 && count <= 212) {
        callback();
      }
      break;
    case "solid":
      if(count < 32) {
        callback();
      }
      break;
  }
}
