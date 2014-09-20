import java.awt.*;

PImage[] cards;
PImage[] hand;
PVector[] cardLocs;
PImage cardBack;
int[] isShowing;
int ranks[];
boolean firstShowing=true;

Button swapButton, showAllButton, shuffleButton;
int showingAllCards = -1;
int numSwaps=0, bestSwaps=9999;
int numLooks=0, bestLooks=9999;
boolean hasWon=false;
PFont regFont, bigFont;
int lastClickMillis=0;
boolean DEBUG=false;

void setup() {
  size(600,300);
  regFont = createFont("Arial", 12);
  bigFont = createFont("Arial", 20);
  textFont(regFont);
  cards = new PImage[52];
  
  for(int i=1; i<=52; i++){
    cards[i-1] = loadImage(i+".png");
    
  }
  
  cardBack = loadImage("b2fv.png");
  
  hand = new PImage[8];
  cardLocs = new PVector[8];
  isShowing = new int[8];
  ranks = new int[8];
  
  swapButton = new Button("Swap", 20, 160);
  showAllButton = new Button("Show all cards", swapButton.x+swapButton.width+10,160);
  shuffleButton = new Button("Shuffle (reset)", showAllButton.x+showAllButton.width+10,160);
  shuffleAndDeal();
  noLoop();
  redraw();
  loop();
  
  println("DIRECTIONS:\n1. Click a card to show its face\n2.If two cards are face up click 'swap' to swap thier positions\n2a.double-clicking anywhere attempts to swap");
  println("GOAL: get the cards into sorted order with the fewest number of 'looks' and 'swaps' as you can.");
  println("RULES: \n1. you can only see at most two cards at once \n2. you can only swap if two cards are selected.\n3. your score doesn't count if you show all cards.");
}

void shuffleAndDeal(){
  int CARD_WIDTH=72;
 
  for(int i=0; i<hand.length; i++){
    int cardIndex = (int)random(0,52);
    hand[i] = cards[cardIndex];
    ranks[i] = 13-(int)((cardIndex)/4);  //rank of card is based on position in cards[]
                              // cards[0]-cards[3] == ACE, cards[4]-cards[7]==KING, etc.
    cardLocs[i] = new PVector(10+i*(CARD_WIDTH+2), 50);
    isShowing[i]=-1;
    
  }
  redraw();
}
void draw() {

  background(255);
  swapButton.draw();
  showAllButton.draw();
  shuffleButton.draw();
  fill(0);
  text("Num Swaps: "+numSwaps, 50, 200);
  text("Num Looks: "+numLooks, 50, 220);
  
  text("Best Swaps: "+bestSwaps, 450, 200);
  text("Best Looks: "+bestLooks, 450, 220);
  
  for(int i=0; i<hand.length; i++){
    if(isShowing[i]==1 || showingAllCards==1){ //if showing draw face up from hand
          if(isShowing[i]==1 && showingAllCards==1 ){ //highlight card since all are face up.
            fill(0,255,0);
            rect(cardLocs[i].x-2, cardLocs[i].y-2, hand[i].width+4, hand[i].height+4);
            fill(0);
          }
          image(hand[i], cardLocs[i].x, cardLocs[i].y);
    }
    else{ //else show cardback
      image(cardBack, cardLocs[i].x, cardLocs[i].y);
    }
   
  }
  //rect(0,200,width,height);
  
 // checkForWin();
 if(hasWon){
   textFont(bigFont);
   text("CARDS ARE SORTED!!!", 100, 250);
   textFont(regFont);
 }
 
}

void checkForWin(){
  
  if(DEBUG) print("Ranks: ");
  if(DEBUG) println(ranks);
  for(int i=1; i<ranks.length; i++){
    if(ranks[i-1]>ranks[i]){
      if(DEBUG) println("\tNOT in order");
      return;
    }
  }
  if(DEBUG) println("WIN -- in order");
  hasWon=true;
  
  if(numLooks<bestLooks && numSwaps<bestSwaps){
    bestLooks = numLooks;
    bestSwaps=bestSwaps;
  }
  
  
}

void swapCards(int from, int to){
  
  PImage tempImg = hand[from];
  int tempRank = ranks[from];
  
  //cardLocs[from] = cardLocs[to];
  hand[from] = hand[to];
  ranks[from] = ranks[to];
  
  //cardLocs[to] = tempLoc;
  hand[to] = tempImg;
  ranks[to] = tempRank;
  
  numSwaps++;
  checkForWin();
}

//PRE-CONDITION: assumes two cards are showing already
void swapCardsShowing(){ 
   if(numShowing()!=2) return;
   if(DEBUG) println("swapping showing cards..."); 
   int from=-1, to=-1;
   for(int i=0; i<isShowing.length; i++){
      if(isShowing[i] > 0){
        if(from==-1) from=i;
        else to=i;
      }
   }
   if(DEBUG) println("...swapping "+from+" and "+to);
   swapCards(from, to);
  
}

int numShowing(){
  int num=0;
  for(int i=0; i<isShowing.length; i++){
    num += isShowing[i];
  }
  if(DEBUG) println((num+8)/2);
  return (num+8)/2;
}

void doubleClick(){ //gets called by mouseClicked
  if(DEBUG) println("DOUBLE-CLICK!!!!");
  lastClickMillis=0;
  swapCardsShowing();
}

void mouseClicked(){
  
  
  if(showAllButton.contains(mouseX,mouseY)){
    showingAllCards *= -1;
    numSwaps=9999;
    numLooks=9999;
    println("Once you show all the cards, your score doesn't count");
  }
  else if(shuffleButton.contains(mouseX,mouseY)){
     numSwaps=0;
     numLooks=0;
     shuffleAndDeal();
  }
  else if(swapButton.contains(mouseX, mouseY)){
    swapCardsShowing();
  }
  
  //if(showingAllCards==1) return; //can't do anything else if all cards showing
  
 
  for(int i=0; i<cardLocs.length; i++){
    
    if(mouseX > cardLocs[i].x && mouseX < cardLocs[i].x+hand[i].width && 
           mouseY > cardLocs[i].y && mouseY < cardLocs[i].y+hand[i].height){
             
            if(isShowing[i]==1 || numShowing()<2){ //toggle if it's showing already, or we have < 2 showing
              isShowing[i]*=-1;
              if(isShowing[i]>0) numLooks++;
            }
            else{
              println("Can only show 2 cards at once. Hide a card first");
            }
    }
  }
  int m = millis();
  int diff = m-lastClickMillis;
    if(DEBUG) println("m="+m+", last="+lastClickMillis+", diff="+diff);

  if(diff < 250){
    doubleClick();
    return;
  }
  lastClickMillis=m;
 
  //image(hand[selectedCard], cardLocs[selectedCard].x, cardLocs[selectedCard].y+200);
    
}

public class Button{
  
 // Rectangle buttonRect;
  public String buttonText;
  public int x,y,width,height;
  
  public Button(String text, int x, int y){
    this.x=x;
    this.y=y;
    this.width =  (int)textWidth(text)+16;
    this.height = (int)textAscent()+(int)textDescent()+4;
    buttonText = text;
   
    
    
  }
  
  public boolean contains(int x, int y){
    
    return x>this.x && x<this.x+this.width && y>this.y && y<this.y+this.height;
  }
  
  public void draw(){
    fill(0);
    rect(this.x, this.y, this.width, this.height);
    fill(255);
    text(buttonText, this.x+8, this.y+textAscent()+textDescent());
  }
}

