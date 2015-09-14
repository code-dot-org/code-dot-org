Feature: Opening the function editor

Background:
  Given I am on "http://learn.code.org/s/course4/stage/14/puzzle/12?noautoplay=true"
  And I rotate to landscape
  And I wait to see ".markdown-level-header-text"
  Then element ".markdown-level-header-text" has text "Puzzle 12 of 17"
  And I close the dialog
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Opening the function editor and moving an inner block doesn't bump function
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And I scroll the modal blockspace to the bottom
  And "modal function block" refers to block "31"
  And "inner repeat block" refers to block "32"
  And block "modal function block" is at a blockly location "function definition location"
  And I begin to drag block "inner repeat block" to offset "50, 50"
  Then block "modal function block" is at blockly location "function definition location"

@chrome
Scenario: Opening / closing the function editor, shouldn't be able to connect to invisible child blocks
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And I press "modalEditorClose"

  And "invisible repeat loop within function" refers to block "43"
  And I open the blockly category with ID "1"
  And "move forward in toolbox" refers to block "51"
  And I drag block "move forward in toolbox" into first position in repeat block "invisible repeat loop within function"
  And "move forward on blockspace" refers to block "59"
  And block "move forward on blockspace" is not child of block "invisible repeat loop within function"
