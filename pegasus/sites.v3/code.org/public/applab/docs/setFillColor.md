---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setFillColor(color)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Sets the fill color for the active canvas.

[/short_description]

The fill color controls, for the active canvas, the interior color of shapes drawn with [rect](/applab/docs/rect) and [circle](/applab/docs/circle). The outline color of circles and rectangles is set using [setStrokeColor](/applab/docs/setStrokeColor).

The *color* parameter must be a string enclosed in quotes, and can take one of four forms.  It can be:

 * the name of the color
 * the hex value of the color (preceded by a #)
 * the rgb value of the color
 * the rgba value of the color (last value specifies the alpha channel for transparency) 
 
The default fill color is transparent.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a black bordered circle filled with yellow.
createCanvas("canvas1");
setFillColor("yellow");
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Worried!** Draw a worried emoticon face using filled shapes.

```
// Draw a worried emoticon face using filled shapes.
createCanvas("canvas1");
setFillColor("yellow");
circle(160, 240, 100);
setFillColor("black");
circle(125, 215, 20);
circle(195, 215, 20);
setFillColor("white");
rect(100, 260, 120, 20);

```

[/example]

____________________________________________________


[example]

**Example: 4 Ways** Demonstrate all 4 ways to specify the *color* parameter.

```
// Demonstrate all four ways to specify the color parameter.
createCanvas("canvas1");
// Sets the color using the name of a color in a string.
setFillColor("chartreuse");
circle(50, 50, 40);

// Sets the color using the hex value of a color in a string.
setFillColor("#7fff00");
circle(100, 50, 40);

// Sets the color using the rgb value of a color in a string.
setFillColor("rgb(127, 255, 0)");
circle(50, 100, 40);

// Sets the color using a rgba value of a color in a string.
// The last value is the amount of transparency, a percentage between 0.0 and 1.0 
setFillColor("rgba(127, 255, 0, 0.5)");
circle(100, 100, 40);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
setFillColor(color)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| color | String | Yes | The color of the pen used to fill circles and rectangles. |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- A canvas element must be created before the stroke color can be changed. Create a canvas element in Design mode first, or call [createCanvas()](/applab/docs/createCanvas) before calling setStrokeColor.
- setFillColor only affects the active canvas. If there is more than one canvas, each one can have a different fill color.
- The color "transparent" will not fill in anything.
- Recall Unit 1 lessons about hex and rgb color values and see [HTML named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Color_keywords) for a complete list of all available colors.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
