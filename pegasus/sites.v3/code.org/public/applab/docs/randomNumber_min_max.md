---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## randomNumber(min, max)

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Returns a random number in the closed range from *min* to *max*.

[/short_description]

You will find many opportunities in your apps to utilize random numbers. For turtle drawing you can randomize all the movement functions, the pen RGB color, pen thickness, and dot size. Any numeric function parameter with a valid range of values can be randomized.

[/description]

### Examples
____________________________________________________

[example]

```
// Generates a random number in the range 5 to 20 (inclusive).
console.log(randomNumber(5, 20));       
```

[/example]

____________________________________________________

[example]

**Random Walk** Do a "random walk" of 4 steps, turning a random number of degrees after each step.

```
// Do a "random walk" of 4 steps, turning a random number of degrees after each step.
moveForward();
turnRight(randomNumber(-90, 90));
moveForward();
turnRight(randomNumber(-90, 90));
moveForward();
turnRight(randomNumber(-90, 90));
moveForward();
```

[/example]

____________________________________________________

[example]

**Clouds** Draw a cloud mass using randomly sized dots at random locations near each other.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a cloud mass using randomly sized dots at random locations near each other.
penColor("skyblue");
dot(300);
penUp();
penRGB(245, 245, 245,0.3);
moveTo(randomNumber(0, 320),randomNumber(0, 450));
for (var i = 0; i &lt; 50; i++) {
  moveTo(getX()+randomNumber(-25, 25),getY()+randomNumber(-25, 25));
  dot(randomNumber(25,50));
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/b3f96418d84bf7ebe1977070d7d745d2-image-1446232619392.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
randomNumber(min, max);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| min | number | Yes | The minimum number returned  |
| max | number | Yes | The maximum number returned  |

[/parameters]

[returns]

### Returns
Returns a random number in the range min to max (inclusive). The number returned will always be an integer.

[/returns]

[tips]

### Tips
- Negative values for parameters *min* or *max* are allowed.
- If you accidently make *min* larger than *max* it will still return a random number in the range.
- The number returned is not truly random as defined in mathematics but is [pseudorandom](http://en.wikipedia.org/wiki/Pseudorandom_number_generator).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
