function haiku(){
if(title){
  textAlign(CENTER,CENTER);
  stroke("white");
  fill("black");
  strokeWeight(2);
  textFont("Courier New");
  var defaultSize=25;
  
textStyle(BOLD);
  textSize(defaultSize*1.6);
  if(textWidth(title)>370){
  textSize(defaultSize*1.6*370/textWidth(title));
  }
  text(title,200,75);


textSize(defaultSize*0.8);
if(textWidth(author)>370){
  textSize(defaultSize*1.25*370/textWidth(author));
}
text(author,200,115);

textStyle(BOLD);
textSize(defaultSize);
if(textWidth(string1)>370){
  textSize(defaultSize*370/textWidth(string1));
}
text(string1,200,175);


textSize(defaultSize);

if(textWidth(string2)>370){
  textSize(defaultSize*370/textWidth(string2));
}
text(string2,200,225);


textSize(defaultSize);
if(textWidth(string3)>370){
  textSize(defaultSize*370/textWidth(string3));
}
text(string3,200,275);
}
}
other.push(haiku);
