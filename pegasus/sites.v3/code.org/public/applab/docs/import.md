---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Importing screens and assets

You can import screens and assets from one App Lab project to another App Lab project by using the “Import screens” feature.  To do this, you will first need to get the share link of the project you want to import from.  

The author of an App Lab project can give you the share link by clicking on the Share button found at the top of the App Lab project: 

<img src="assets/shareButton.png" style="width:70%">

This will open up a dialog from which they can then copy the share URL and share with others: 

<img src="assets/shareLink.png" style="width:70%">

Once you have this URL, go to Design Mode in your project and click the screen selector: 

<img src="assets/screenSelector.png" style="width:40%">

Click on “Import screens…”  This will bring up the following dialog: 

<img src="assets/importScreenDialog.png" style="width:70%">

Paste in the Share URL from earlier into this dialog and hit “Next.”   This will give you another dialog where you can select the set of screens and assets to import:

<img src="assets/importScreenDialog2.png" style="width:70%">

Any assets used in a screen in design mode will get automatically imported when you import the given screen.  All other assets not used directly in design mode (but may be used in code) get listed under “Other assets.”  Simply select whichever screens and assets you want to import and click Import.  That’s it!  

Here are some things to watch out for:

* If you import a screen or an asset with the same name as an existing screen or asset, it will get replaced in your project.  You will get a warning about this in your project as such: 

  <img src="assets/importWarning.png" style="width:70%">

* In some cases, you might not be able to import a given screen.  This usually happens if that screen uses a design element with an ID that is being used for a design element on a different screen.  For example, if you are trying to import a screen called “main_screen” which uses a text label with the ID “label1” and you have a “screen1” in your existing project that also uses a “label1,” you will not be able to able to import “main_screen.”  To fix this, either remove or rename “label1” to something else in either of the projects.  

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
