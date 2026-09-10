---
title: App Lab
description: Reference for the App Lab workspace — the Design tab, Code tab, toolbox categories, screens, and Debug Console.
type: reference
---

App Lab is a programming environment for building apps with buttons, screens, and JavaScript. The workspace is split into a **Design** tab for laying out screens visually and a **Code** tab for writing logic as blocks or text. A phone-shaped preview (320 by 480 pixels) runs the app in place. This page describes each region of the workspace and what you can do there.

For tasks that use App Lab, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/). To share or export a finished app, see [Sharing and publishing a project](/guide/projects/sharing-and-publishing/).

## Design tab

The Design tab is where you build what your app looks like. It contains the preview, the element tray, and the properties panel.

### Element tray

The element tray lists the element types you can add to a screen. Drag an element from the tray onto the preview to place it.

![The element tray in the Design Toolbox, showing icons for each element type with a theme picker above](images/app-lab-element-tray.png)

The available types are:

- **Button** -- a clickable button.
- **Text Input** -- a single-line text field. Supports a placeholder value shown when the field is empty.
- **Text Area** -- a multi-line text field.
- **Label** -- a read-only text label.
- **Dropdown** -- a select menu. Configure its options in the properties panel.
- **Radio Button** -- a radio button. Radio buttons that share a group id are mutually exclusive.
- **Checkbox** -- a checkbox with a checked/unchecked state.
- **Image** -- displays an image. You can upload your own or choose from the built-in library.
- **Canvas** -- a drawable surface for pixel-level graphics. Canvas blocks in the Code tab draw onto it.
- **Chart** -- renders data as a chart.
- **Slider** -- a range input. Configure its minimum value, maximum value, and step size.
- **Photo Select** -- an image upload button that lets the user choose a photo at runtime.

### Properties panel

Select an element on the preview to open the properties panel on the right.

![The properties panel showing the id, background color, and image fields for a selected screen, with Properties and Events tabs at the top](images/app-lab-properties-panel.png)

Every element has an **id** (the name your code uses to refer to it) and position fields (**x position**, **y position**, **width**, **height**). Other properties depend on the element type:

- **text**, **text color**, **background color**, **font family**, **font size**, **text alignment** -- available on buttons, labels, text inputs, and text areas.
- **image** and **icon color** -- available on buttons and images. Opens a picker for uploading or choosing from the icon library.
- **border color**, **border width**, **border radius** -- available on most elements.
- **placeholder** and **read only** -- available on text inputs.
- **options** -- available on dropdowns. Each option is one line.
- **group id** -- available on radio buttons. Buttons in the same group are mutually exclusive.
- **minimum value**, **maximum value**, **step size** -- available on sliders.
- **fit image** -- available on images. Options are contain, cover, fill, and none.
- **hidden** -- hides the element at the start; your code can show it later.

The properties panel also shows **depth** controls (**Send Forward**, **Send Backward**, **Send Front**, **Send to Back**) that change the stacking order of overlapping elements, and buttons to **Duplicate** the element, **Copy to Screen** (copy it to a different screen), or **Delete** it. Delete asks for confirmation on screens.

### Screens

Every App Lab project has at least one screen. Each screen holds its own set of elements and can have its own background color, background image, and theme.

![The screen dropdown at the top of the preview, showing the current screen name](images/app-lab-screen-dropdown.png)

The screen dropdown at the top of the preview lists all screens and lets you switch between them. Select **New screen...** from the dropdown to add one.

Each screen has an id and a theme. App Lab ships over 25 built-in themes (such as default, classic, orange, citrus, forest, bubblegum, and others) that set the default colors and fonts for elements on that screen. The first screen in the list is the default screen -- the one the app shows when it starts. On any other screen, a **Make Default** button in the properties panel promotes it to the default.

### Preview

The preview is a 320-by-480-pixel phone-shaped area that shows the current screen's elements. Drag elements to reposition them. The preview is also where your app runs when you select **Run**.

## Code tab

The Code tab is where you write the logic that makes your elements respond to actions. It contains the toolbox and the code workspace.

### Toolbox

The toolbox groups blocks into categories.

![The Code tab toolbox with category tabs at the top and the UI controls category open, showing block signatures](images/app-lab-toolbox.png)

Each category contains blocks for a different part of app building:

- **UI controls** -- event handling (`onEvent`), element creation, reading and setting element properties, screen navigation, audio playback (`playSound`, `stopSound`, `playSpeech`), and opening URLs. This is the largest category.
- **Canvas** -- drawing shapes, lines, and images on a canvas element, and reading or setting individual pixel colors.
- **Data** -- key-value storage, record-based data tables (create, read, update, delete), web requests, charting, and machine-learning predictions.
- **Turtle** -- turtle graphics: movement, turning, pen control, and speed.
- **Variables** -- `console.log`, `console.clear`, and object utilities.
- **Goals** -- comment blocks labeled Goal 1 through Goal 20, used by curriculum levels to structure your work.
- **Advanced** -- low-level DOM access: `innerHTML`, `setStyle`, `getAttribute`, `setAttribute`, and container nesting.

Not every category appears in every level. Which categories are visible depends on the level's configuration.

### Blocks and text

App Lab defaults to block mode: you drag blocks from the toolbox into the workspace and snap them together.

![The Show Text toggle button below the code workspace](images/app-lab-show-code-toggle.png)

Select **Show Text** below the workspace to switch to a text editor showing the equivalent JavaScript. Select **Show Blocks** to switch back.

The conversion from text to blocks has limits. If your text contains JavaScript that has no block equivalent, the editor stays in text mode and shows a warning. Editing in text mode does not lose your work -- the code still runs -- but you cannot return to blocks until you remove or rewrite the unsupported syntax.

Your mode preference (blocks or text) is remembered per level.

## Running and debugging

### Run and Reset

Select **Run** above the preview to execute your program.

![The Run button](images/app-lab-run-button.png)

The app runs inside the preview, responding to clicks and other events. Select **Reset** to stop the program and return the preview to its starting state.

![The Reset button](images/app-lab-reset-button.png)

### Debug Console

The **Debug Console** sits below the code workspace.

![The Debug Console expanded, showing Debug Commands (Break, Step over, Step out, Step in), the console output area with input prompt, Clear button, and Watchers pane](images/app-lab-debug-console.png)

It serves three purposes:

- **Output.** Anything your code writes with `console.log` appears here. Errors show as red text with the line number where the program stopped. Warnings show with a yellow background.
- **Input.** While your program is running, you can type a JavaScript expression into the console's input field and press Enter to evaluate it. The result appears in the output area. If the program is not running, the console prints "(not running)".
- **Command history.** Press the up and down arrow keys in the input field to cycle through previous expressions.

## Troubleshooting

### The editor will not switch back to blocks

Your text contains JavaScript that has no block equivalent. Remove or simplify the unsupported syntax, then select **Show Blocks** again.

### The Debug Console shows a red error

Read the message to find the line number. Common causes are a missing parenthesis, quotation mark, or semicolon. Fix the error and select **Run** again. If no error appears but nothing happens, check that your event handler's element id matches the element's id in the Design tab exactly -- capitalization matters.

## Further reading

- [Sharing and publishing a project](/guide/projects/sharing-and-publishing/)
- [Storing data in your app](/guide/projects/store-data-in-your-app/)
- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
