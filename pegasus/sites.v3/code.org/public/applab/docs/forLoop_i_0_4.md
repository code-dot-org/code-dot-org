---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## for loop

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Executes a block of statements a certain number of times depending on the the initialization expression, conditional expression, and increment expression.

[/short_description]

Instead of typing a block of statements again and again, you can use a *for loop* around the block of statements. The most common usage of a for loop is simply to use it as a *counting* loop to execute a block of code a certain number of times.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw 4 dots along a line.
for(var i=0; i<4; i++){
	dot(5);
	moveForward();
}
```

[/example]
____________________________________________________
[example]

**Example: Count Down** Count down to zero from ten using a negative increment.

```
// Count down to zero from 10.
for(var i=10; i>0; i--){
    write(i) ;
}
write('Blast Off!');
```

[/example]
____________________________________________________
[example]

**Example: One Inch** Draw 8 tic marks along a line.

```
penUp();
turnLeft();
moveForward(100);
turnLeft(180);
penDown();
for(var i=0; i<7; i++){
    ticMark();
    moveForward();
}
ticMark();
penUp();
moveForward();

function ticMark() {
    turnLeft();
    moveForward(5);
    turnLeft(180);
    moveForward(5); 
    turnLeft();  
}
```

[/example]

____________________________________________________
[example]

**Example: Rake** Draw a rake ranging the angles from -45 to 45 by 5s.

```
// Draw a rake ranging the angles from -45 to 45 by 5s.
for(var angle=-45; angle<=45; angle=angle+5){
	turnTo(angle);
	moveForward(100);
	turnLeft(180);
	moveForward(100);
}
turnTo(180);
moveForward(200);
```

[/example]
____________________________________________________
[example]

**Example: Flower** Draw a flower with a parameter number of petals. Works best for petalCount between 5 and 10.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a flower with a parameter number of petals. Works best for petalCount between 5 and 10.
drawFlower(5);

function drawFlower(petalCount) {
  penColor("pink");
  penUp();
  for(var i=0; i&lt;360; i=i+(360/petalCount)){
    turnTo(i);
    moveForward(360/petalCount);
    dot((2/3)*360/petalCount);
    moveForward(-360/petalCount);	
  }
  penColor("blue");
  dot(360/petalCount/2);
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/807a8c3df4c66aae1e5db637ffda7e59-image-1446383236765.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[example]

**Example: Random Die Rolls** Simulate rolling a die using a random number from 1 to 6, and roll the die 10000 times to check if the expected roll is 3.5.

```
// Simulate rolling a die using a random number from 1 to 6, and roll the die 10000 times to check if the expected roll is 3.5.
var sum = 0;
for (var i = 0; i < 10000; i++) {
    sum = sum + randomNumber(1,6);
}
console.log(sum/10000);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
for (initialization; condition; increment) {
  // block of statements
}
```

Here is a typical construct for loop used to count from 0 to 3 to execute the block of code 4 times:

<code>for(var i = 0; i < 4; i++)</code>

**initialization**  <code>var i = 0;</code> is executed once, before anything else. Create an identifier named *i* and initialize it to 0.
 
**condition** <code>i < 4;</code> is checked before each iteration, to see if the block of statements should execute or not. If *i* is less than 4.

**increment** <code>i++</code> is executed after every iteration, after the block of statements is executed. Increase (increment) *i* by 1.

[/syntax]

[tips]

### Tips
- You do not need to use *i* in the for loop statement, you can use any declared and initialized identifier.
- You can start (initialization) and end (condition) the loop at any values. 
- You can use any increment, positive or negative.
- Be careful not to code an infinite loop where the condition is never false.
- Be careful not to code a loop that never executes because the condition is never true.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
