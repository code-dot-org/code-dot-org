function goldilocks(condition, costume, callback) {
  var count = countByAnimation({costume: costume});
  switch(condition) {
    case "too much":
      if(count > 19) {
        callback();
      }
      break;
    case "just right":
      if(count >=2 && count <= 19) {
        callback();
      }
      break;
    case "too little":
      if(count < 2) {
        callback();
      }
      break;
  }
}
