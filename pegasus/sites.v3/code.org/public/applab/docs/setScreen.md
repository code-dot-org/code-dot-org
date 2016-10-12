---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setScreen(screenId)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Sets the screen to the given screenId.

[/short_description]

Most apps are not constructed with only one screen, but have multiple screens for the user to interact with. Maybe first a logon screen, then the screens for the app itself, ending with "game over" or "thank you" screen possibly including a "play again" option. Each screen has its own UI elements with corresponding event handlers.

[/description]

### Examples
____________________________________________________

[example]

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Screen swap. screen2, textLabels and buttons were added in Design mode.
onEvent("screen1button", "click", function(event) {
  setScreen("screen2");
});
onEvent("screen2button", "click", function(event) {
  setScreen("screen1");
});
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/7edc7cae04f11aabdc8974e8216c8024-image-1447072288182.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
setScreen(screenId)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| screenId | string | Yes | The unique identifier for the screen. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _.  |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips

- The default screenId is screen1.
- It is important to use meaningful screen IDs, and meaningful and unique UI element IDs, so it is easy to tell which UI elements are on which screen.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
