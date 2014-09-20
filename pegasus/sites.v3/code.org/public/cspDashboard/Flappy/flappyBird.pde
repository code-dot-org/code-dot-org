import java.util.*;

/******** This code not exposed to students *****/
/** Scroll to bottom to see student code view **/

PVector pillar;
PVector bird;
float dyBird, dxPillar;
float upperPillarY, lowerPillarY, frontPillarX, backPillarX;
FixedSizeQueue Q = new FixedSizeQueue(50);

int PILLAR_WIDTH=50;
int PILLAR_GAP_HEIGHT=100;


void setup(){
  size(400,550);
  pillar = new PVector();
  bird = new PVector(150, 200);
  dyBird = 0;
  resetPillar();
  smooth();
  noStroke();
}

void resetPillar(){
  pillar.x = width;
  pillar.y = PILLAR_GAP_HEIGHT+ (int)random(height-200);
  dxPillar = 1;
}

void mouseClicked(){
   onMouseClick(); //student controlled mouse click handler
  
   if(dxPillar<=0){  //if things have stopped, reset the pillar
     resetPillar();
   }
}

void updatePillar(){
   pillar.x-=dxPillar;
    
   if(pillar.x+PILLAR_WIDTH < 0){
       resetPillar();
   }
   
   upperPillarY = pillar.y;
   lowerPillarY = pillar.y+PILLAR_GAP_HEIGHT;
   frontPillarX = pillar.x;
   backPillarX = pillar.x+PILLAR_WIDTH;
}

void systemUpdateBird(){
  updateBird();
   
  if(bird.y+15 > height){ //stop bird if it hits the ground
    bird.y = height-15;
    crash();
  }
  
}


void draw(){
  fill(255,255,255);
  rect(0,0,width,height);
  
  updatePillar();
  systemUpdateBird();
  
  drawPillar();
  drawBird();

  drawVariables();
 
}

// stop pillar and bird from moving
void crash(){
  dxPillar=0;
  dyBird=0;
}

void drawVariables(){
  fill(0);
  textSize(12);
  text("dyBird bird: "+((int)(dyBird*100))/100.0,10,15);
  text("dx pillar: "+dxPillar, 10, 27);
  
  if(dxPillar==0){
    textSize(100);
    fill(255,0,0);
    text("CRASH", 25, height/2);
    textSize(12);
  }
}
  
//NOTE: there is "one" pillar with an arithmetically derived gap for bird to fly through.
// upper and lower y coordinates of gap are arithmetically derived as well.
void drawPillar(){
  fill(0, 128,0);
  rect(pillar.x, 0, PILLAR_WIDTH, pillar.y);
  rect(pillar.x, pillar.y+PILLAR_GAP_HEIGHT, PILLAR_WIDTH, height);
  stroke(0);
  line(pillar.x, pillar.y, pillar.x, pillar.y+30);
  line(pillar.x, pillar.y, pillar.x-30, pillar.y);
  
  line(pillar.x+PILLAR_WIDTH, pillar.y+70, pillar.x+PILLAR_WIDTH, pillar.y+PILLAR_GAP_HEIGHT);
  line(pillar.x+PILLAR_WIDTH, pillar.y+PILLAR_GAP_HEIGHT, pillar.x+80, pillar.y+PILLAR_GAP_HEIGHT);
  
  textSize(10);
  fill(0);
  text("front x: "+((int)pillar.x), pillar.x+3, pillar.y+30);
  text("upper y: "+((int)pillar.y), pillar.x-60, pillar.y);
  
  text("lower y: "+((int)pillar.y+PILLAR_GAP_HEIGHT), pillar.x+54, pillar.y+110);
  text("back x: "+((int)pillar.x+10), pillar.x+54, pillar.y+80);
  
 


}

void drawBird(){
  fill(255,0,0);
  ellipse(bird.x, bird.y, 30,30);
  stroke(0);
  line(bird.x, bird.y, bird.x-30, bird.y);
  line(bird.x, bird.y, bird.x, bird.y-30);
  textSize(10);
  fill(0);
  
  text("bird y: "+((int)bird.y), bird.x-70, bird.y+11);
  text("bird x: "+((int)bird.x), bird.x-50, bird.y-25);
  

  Q.enqueue(bird.y); //add bird's y-pos to list
  
  //draw bird trail - a dot for previous y-positions
  for(int i=0; i<Q.size; i++){
    fill(255, 0, 0, .33*255);
    noStroke();
    ellipse(bird.x, Q.get(i), 5,5);
  }  
  
}
/**
 Sorry, because it's JS, I had to roll my own fixed-sized FIFO queue.
 Implemented as a circular array
**/
public class FixedSizeQueue{
  
  float[] queue;
  int front, back, size;
 
   public FixedSizeQueue(int size){
    queue = new float[size];
    front = back = 0;
   }
  
   public void enqueue(float f){
     
     //if full, remove the front element to make room
     if(size>=queue.length) removeFront();
     
     queue[back]=f;
     back++;
     back = back%queue.length;
     size++;
  }
  
  public void removeFront(){
    front++;
    front = front%queue.length;
    size--;
  }
  
  //public int size(){ return size; }
  
  public float get(int i){
     
      return queue[(front+i)%queue.length];
    
  }
  
  public String toString(){
     String data = "Q:\nfront="+front+"\nback="+back+"\n[";
     for(int i=0; i<queue.length; i++){
       data += "("+i+")"+get(i)+" ";
     }
     return data+"]";
    
  }
}

/*********** HERE IS WHAT THE STUDENT WRITES *********/
/******but with blocks that map to higher level things***/
/**student's view: 
  1) they have to do something when the mouse is clicked
  2) they have to update the bird's position every cycle of animation loop
  3) they have some blocks for getting/setting positions of things and if statements
 ****/
              

void onMouseClick(){
   dyBird = -3.5; //set bird acceleration in negative direction
}

void updateBird(){
  
  bird.y += dyBird; //make bird fall naturally
  dyBird += 0.2;
  
  
  //coordinate logic for crashing into pillar
  if(bird.x+15 >= frontPillarX && bird.x-15 < backPillarX && !( bird.y+15 < lowerPillarY && bird.y-15 > upperPillarY)){
      crash();
  }

}

