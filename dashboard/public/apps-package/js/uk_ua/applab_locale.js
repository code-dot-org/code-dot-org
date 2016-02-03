var applab_locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"addEventHeader":function(d){return "Click a link below to add a function to your code that will be called when the event is triggered."},
"builtOnCodeStudio":function(d){return "Built on Code Studio"},
"catActions":function(d){return "Actions"},
"catControl":function(d){return "Loops"},
"catEvents":function(d){return "Events"},
"catLogic":function(d){return "Logic"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variables"},
"container":function(d){return "create container"},
"containerTooltip":function(d){return "Creates a division container and sets its inner HTML."},
"copyright":function(d){return "Copyright"},
"designToolboxDescription":function(d){return "Drag the elements into your app!"},
"designToolboxHeader":function(d){return "Design Toolbox"},
"designWorkspaceDescription":function(d){return "Click on an element or choose it from the dropdown below to edit its properties. Create code in Events."},
"designWorkspaceHeader":function(d){return "Workspace"},
"dropletBlock_appendItem_description":function(d){return "Append the item to the end of the array"},
"dropletBlock_appendItem_param0":function(d){return "list"},
"dropletBlock_appendItem_param0_description":function(d){return "The array to be modified."},
"dropletBlock_appendItem_param1":function(d){return "item"},
"dropletBlock_appendItem_param1_description":function(d){return "The item to add to the end of the array."},
"dropletBlock_arcLeft_description":function(d){return "Moves the turtle forward and to the left in a smooth, circular arc."},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "radius"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Moves the turtle forward and to the right in a smooth, circular arc."},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "radius"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_button_description":function(d){return "Creates a button on the screen displaying the text provided and referenced by the given buttonId at default location (0,0)."},
"dropletBlock_button_param0":function(d){return "id"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "text"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_checkbox_description":function(d){return "Create a checkbox and assign it an element id"},
"dropletBlock_checkbox_param0":function(d){return "id"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_circle_param0":function(d){return "x"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "y"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Clear all data on the active canvas"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Displays the string or variable in the console display"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "id"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "height"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "Using App Lab's table data storage, creates a record with a unique id in the table name provided, and calls the callbackFunction when the action is finished."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "callback"},
"dropletBlock_declareAssign_list_abd_description":function(d){return "Declare a variable and assigns an array to it with the given initial values"},
"dropletBlock_declareAssign_list_abd_signatureOverride":function(d){return "Declare and assign an array to a variable"},
"dropletBlock_declareAssign_str_hello_world_description":function(d){return "Declare a variable and assign a string to it"},
"dropletBlock_declareAssign_str_hello_world_signatureOverride":function(d){return "Declare and assign a string to a variable"},
"dropletBlock_deleteElement_description":function(d){return "Delete the element with the specified id"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Using App Lab's table data storage, deletes the provided record in tableName. record is an object that must be uniquely identified with its id field. When the call is completed, the callbackFunction is called."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "record"},
"dropletBlock_deleteRecord_param2":function(d){return "callback"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_dot_description":function(d){return "Draws a dot centered at the turtle's location with the specified radius."},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawChart_description":function(d){return "Draws a chart to the specified chart element using the data provided."},
"dropletBlock_drawChart_param0":function(d){return "chartId"},
"dropletBlock_drawChart_param1":function(d){return "chartType"},
"dropletBlock_drawChart_param2":function(d){return "chartData"},
"dropletBlock_drawChart_param3":function(d){return "options"},
"dropletBlock_drawChart_param4":function(d){return "callback"},
"dropletBlock_drawChartFromRecords_description":function(d){return "Draws a chart to the specified chart element using data retrieved from the specified table."},
"dropletBlock_drawChartFromRecords_param0":function(d){return "chartId"},
"dropletBlock_drawChartFromRecords_param1":function(d){return "chartType"},
"dropletBlock_drawChartFromRecords_param2":function(d){return "tableName"},
"dropletBlock_drawChartFromRecords_param3":function(d){return "columns"},
"dropletBlock_drawChartFromRecords_param4":function(d){return "options"},
"dropletBlock_drawChartFromRecords_param5":function(d){return "callback"},
"dropletBlock_drawImage_description":function(d){return "Draws the specified image or canvas element onto the active canvas at the specified position, and optionally scales the element to the specified width and height"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "width"},
"dropletBlock_drawImage_param4":function(d){return "height"},
"dropletBlock_drawImageURL_description":function(d){return "Draws the image at the specific URL onto the active canvas element."},
"dropletBlock_drawImageURL_param0":function(d){return "url"},
"dropletBlock_drawImageURL_param0_description":function(d){return "The URL to an image. Can be an project asset name or external URL."},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(id, option1, option2, ..., optionX)"},
"dropletBlock_getAlpha_description":function(d){return "Returns the amount of alpha (opacity) (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Gets the given attribute"},
"dropletBlock_getBlue_description":function(d){return "Gets the amount of blue (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Get the state of a checkbox or radio button"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Returns the current direction that the turtle is facing. 0 degrees is pointing up"},
"dropletBlock_getGreen_description":function(d){return "Gets the amount of green (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Returns an object representing the image data captured from the canvas in the coordinate range from startX, startY to endX, endY"},
"dropletBlock_getImageData_param0":function(d){return "x"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "y"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "width"},
"dropletBlock_getImageData_param2_description":function(d){return "The width of the bounding rectangle to capture the image data."},
"dropletBlock_getImageData_param3":function(d){return "height"},
"dropletBlock_getImageData_param3_description":function(d){return "The height of the bounding rectangle to capture the image data."},
"dropletBlock_getImageURL_description":function(d){return "Get the URL for the provided image element id"},
"dropletBlock_getImageURL_param0":function(d){return "id"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Retrieves the value stored at the provided key name in App Lab's key/value data storage. The value is returned as a parameter to callbackFunction when the retrieval is finished"},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "callback"},
"dropletBlock_getRed_description":function(d){return "Gets the amount of red (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Get the text from the specified element"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app"},
"dropletBlock_getXPosition_description":function(d){return "Get the element's x position"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getX_description":function(d){return "Gets the current x coordinate in pixels of the turtle"},
"dropletBlock_getYPosition_description":function(d){return "Get the element's y position"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Gets the current y coordinate in pixels of the turtle"},
"dropletBlock_hideElement_description":function(d){return "Hides the element with the provided id so it is not shown on the screen"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Makes the turtle invisible at its current location."},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_image_description":function(d){return "Displays the image from the provided url on the screen"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_indexOf_description":function(d){return "Returns the position of the first occurrence of searchValue within the string"},
"dropletBlock_indexOf_param0":function(d){return "searchValue"},
"dropletBlock_indexOf_param0_description":function(d){return "The string to search for."},
"dropletBlock_indexOf_signatureOverride":function(d){return "[string].indexOf(searchValue)"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_insertItem_description":function(d){return "Insert the item into the array at the specified position"},
"dropletBlock_insertItem_param0":function(d){return "list"},
"dropletBlock_insertItem_param0_description":function(d){return "The array to be modified."},
"dropletBlock_insertItem_param1":function(d){return "index"},
"dropletBlock_insertItem_param1_description":function(d){return "The position to insert the item into the array."},
"dropletBlock_insertItem_param2":function(d){return "item"},
"dropletBlock_insertItem_param2_description":function(d){return "The item to insert into the array."},
"dropletBlock_length_description":function(d){return "The length of the string"},
"dropletBlock_length_signatureOverride":function(d){return "[string].length"},
"dropletBlock_line_description":function(d){return "Draws a line on the active canvas from x1, y1 to x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
"dropletBlock_listLength_description":function(d){return "The length of the array"},
"dropletBlock_listLength_signatureOverride":function(d){return "[list].length"},
"dropletBlock_moveBackward_description":function(d){return "Moves the turtle backward a given number of pixels from the current direction."},
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Moves the turtle forward a given number of pixels in the current direction."},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Moves the turtle to a specific (x,y) position on the screen."},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Moves the turtle by adding x pixels to the turtle's current x position and y pixels to the turtle's current y position."},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_onEvent_description":function(d){return "Executes the callback code when a specific event type occurs for the specified UI element id."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "type"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "callback"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_penColor_description":function(d){return "Sets the color of the pen used by the turtle for drawing lines and dots."},
"dropletBlock_penColor_param0":function(d){return "color"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penDown_description":function(d){return "Puts the pen down so the turtle draws a line behind it as it moves."},
"dropletBlock_penRGB_description":function(d){return "Using RGBA values, sets the color of the pen used by the turtle for drawing lines and dots."},
"dropletBlock_penRGB_param0":function(d){return "r"},
"dropletBlock_penRGB_param0_description":function(d){return "The amount of red (0-255) in the pen used by the turtle for drawing lines and dots."},
"dropletBlock_penRGB_param1":function(d){return "g"},
"dropletBlock_penRGB_param1_description":function(d){return "The amount of green (0-255) in the pen used by the turtle for drawing lines and dots."},
"dropletBlock_penRGB_param2":function(d){return "b"},
"dropletBlock_penRGB_param2_description":function(d){return "The amount of blue (0-255) in the pen used by the turtle for drawing lines and dots."},
"dropletBlock_penRGB_param3":function(d){return "a"},
"dropletBlock_penRGB_param3_description":function(d){return "The opacity, a number between 0.0 (fully transparent) and 1.0 (fully opaque), of the color used by the turtle for drawing lines and dots. Default is 1.0."},
"dropletBlock_penUp_description":function(d){return "Picks the pen up so the turtle does not draw a line as it moves."},
"dropletBlock_penWidth_description":function(d){return "Sets the width of the line in pixels that the turtle draws behind it as it moves."},
"dropletBlock_penWidth_param0":function(d){return "width"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Plays the MP3 sound file from the specified URL."},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Puts the input image data onto the current canvas element starting at position startX, startY"},
"dropletBlock_putImageData_param0":function(d){return "imgData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "x"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "y"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Creates a radio button and assigns it to a group for choosing from a predefined set of options. Only one radio button in a group can be selected at a time"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_readRecords_description":function(d){return "Using App Lab's table data storage, reads the records from the provided tableName that match the searchTerms. When the call is completed, the callbackFunction is called and is passed the array of records."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "terms"},
"dropletBlock_readRecords_param2":function(d){return "callback"},
"dropletBlock_rect_description":function(d){return "Draws a rectangle onto the active canvas positioned at upperLeftX and upperLeftY, and size width and height."},
"dropletBlock_rect_param0":function(d){return "x"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "y"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "width"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "height"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_removeItem_description":function(d){return "Remove the item at the specified position from the array"},
"dropletBlock_removeItem_param0":function(d){return "list"},
"dropletBlock_removeItem_param0_description":function(d){return "The array to be modified."},
"dropletBlock_removeItem_param1":function(d){return "index"},
"dropletBlock_removeItem_param1_description":function(d){return "The position of the item to remove from the array."},
"dropletBlock_setActiveCanvas_description":function(d){return "Change the active canvas to the canvas with the specified id (other canvas commands only affect the active canvas)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "id"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Sets the amount of alpha (opacity) (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setBlue_description":function(d){return "Sets the amount of blue (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the blueValue input amount."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active canvas"},
"dropletBlock_setFillColor_param0":function(d){return "color"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Sets the amount of green (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the greenValue input amount."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Sets the URL for the provided image element id"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Execute the callback function code every time a certain number of milliseconds has elapsed, until canceled"},
"dropletBlock_setInterval_param0":function(d){return "callback"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "ms"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Stores a key/value pair in App Lab's key/value data storage, and calls the callbackFunction when the action is finished."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "callback"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Positions an element at an x,y screen coordinate, and optionally sets a new width and height for the element."},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param0_description":function(d){return "The ID of the UI element to which this event handler applies."},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param1_description":function(d){return "The x coordinate on the screen to move the UI element to."},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param2_description":function(d){return "The y coordinate on the screen to move the UI element to."},
"dropletBlock_setPosition_param3":function(d){return "width"},
"dropletBlock_setPosition_param3_description":function(d){return "Optional. The width to set the UI element to, in pixels."},
"dropletBlock_setPosition_param4":function(d){return "height"},
"dropletBlock_setPosition_param4_description":function(d){return "Optional. The height to set the UI element to, in pixels."},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "red"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "green"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "blue"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Sets the amount of red (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the redValue input amount."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setScreen_description":function(d){return "Sets the screen to the given screenId"},
"dropletBlock_setScreen_param0":function(d){return "screenId"},
"dropletBlock_setScreen_param0_description":function(d){return "The unique identifier for the screen. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _."},
"dropletBlock_setSize_description":function(d){return "Sets the width and height for the UI element."},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "text"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "callback"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "ms"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Shows the element with the provided id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Makes the turtle visible at its current location."},
"dropletBlock_speed_description":function(d){return "Sets the speed for the app's execution, which includes the turtle's speed."},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_substring_description":function(d){return "Returns a string extracted between the start and end positions of the original string"},
"dropletBlock_substring_param0":function(d){return "start"},
"dropletBlock_substring_param0_description":function(d){return "The position to start the extraction."},
"dropletBlock_substring_param1":function(d){return "end"},
"dropletBlock_substring_param1_description":function(d){return "The position (up to, but not including) to stop the extraction."},
"dropletBlock_substring_signatureOverride":function(d){return "[string].substring(start, end)"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "id"},
"dropletBlock_textInput_param1":function(d){return "text"},
"dropletBlock_textLabel_description":function(d){return "Creates a text label on the screen displaying the text provided and referenced by the given labelId at default location (0,0)."},
"dropletBlock_textLabel_param0":function(d){return "id"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "text"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_toLowerCase_description":function(d){return "Converts the original string to use all lowercase letters and returns it as a new string"},
"dropletBlock_toLowerCase_signatureOverride":function(d){return "[string].toLowerCase()"},
"dropletBlock_toUpperCase_description":function(d){return "Converts the original string to use all uppercase letters and returns it as a new string"},
"dropletBlock_toUpperCase_signatureOverride":function(d){return "[string].toUpperCase()"},
"dropletBlock_turnLeft_description":function(d){return "Rotates the turtle left by the specified angle. The turtle’s position remains the same."},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Rotates the turtle right by the specified angle. The turtle’s position remains the same."},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Changes the turtle's direction to a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Using App Lab's table data storage, updates the provided record in tableName. record must be uniquely identified with its id field. When the call is completed, the callbackFunction is called"},
"dropletBlock_updateRecord_param0":function(d){return "table"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callback"},
"dropletBlock_write_description":function(d){return "Appends the specified text to the bottom of the document. The text can also be formatted as HTML."},
"dropletBlock_write_param0":function(d){return "text"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"makeMyOwnApp":function(d){return "Make my own app"},
"manageAssets":function(d){return "Click to view or update your images and sounds."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"privacyPolicy":function(d){return "Privacy Policy"},
"reinfFeedbackMsg":function(d){return "You're finished! Click \"Continue\" to move on to the next level."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "do"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the app is running."},
"reportAbuse":function(d){return "Report Abuse"},
"shareApplabTwitter":function(d){return "Check out the app I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your app:"},
"tryAgainText":function(d){return "Keep working"},
"viewData":function(d){return "View Data"},
"yes":function(d){return "Yes"}};