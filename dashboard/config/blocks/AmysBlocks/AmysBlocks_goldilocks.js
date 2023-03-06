function goldilocks(condition, group, callback) {
  var count = countByAnimation(group);
  switch(condition) {
    case "too much":
      if(count > 15) {
        callback();
      }
      break;
    case "just right":
      if(count >=5 && count <= 15) {
        callback();
      }
      break;
    case "too little":
      if(count < 5) {
        callback();
      }
      break;
  }
}