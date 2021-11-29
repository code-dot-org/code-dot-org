Feature: Opening / closing the function editor

Background:
  Given I am on "http://studio.code.org/s/course4/lessons/14/levels/12?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Opening the function editor and moving an inner block doesn't bump function
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And I scroll the modal blockspace to the bottom
  And "modal function block" refers to block "51"
  And "inner repeat block" refers to block "52"
  And block "modal function block" is at a blockly location "function definition location"
  And I begin to drag block "inner repeat block" to offset "50, 50"
  Then block "modal function block" is at blockly location "function definition location"

@chrome
Scenario: Opening the function editor and hitting the ESC key should close the editor
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And the modal function editor is open
  Then I press keys ":escape" for element "body"
  And the modal function editor is closed

@chrome
Scenario: Opening / closing the function editor, shouldn't be able to connect to invisible child blocks
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And I press the first "#modalEditorClose > .blocklyText" element

  And "invisible repeat loop within function" refers to block "63"
  And I open the blockly category with ID "1"
  And "move forward in toolbox" refers to block "71"
  And I drag block "move forward in toolbox" into first position in repeat block "invisible repeat loop within function"
  And "move forward on blockspace" refers to block "79"
  And block "move forward on blockspace" is not child of block "invisible repeat loop within function"
