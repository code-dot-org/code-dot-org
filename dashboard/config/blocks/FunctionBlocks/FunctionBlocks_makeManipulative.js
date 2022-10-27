function makeManipulative(var1, s1costume, behavior) {
  for(var count_i = 0; count_i < var1; count_i++) { 
  makeNewSpriteAnon(s1costume); 
  }
    addBehaviorSimple(({costume: s1costume}), behavior);
}

//Playing around by taking out the xy: 200 piece. 
//function makeManipulative(var1, s1costume, behavior) {
  //for(var count_i = 0; count_i < var1; count_i++) { 
 // makeNewSpriteAnon(s1costume, {"x": 200, "y": 200}); 
    //addBehaviorSimple(({costume: s1costume}), behavior);
  //}
//}