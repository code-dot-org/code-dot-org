Feature: Opening the function editor

Background:
  Given I am on "http://learn.code.org/s/course4/stage/14/puzzle/12?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 12 of 15"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Opening the function editor and bumping blocks
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
  And "modal function block" refers to block "31"
  And block "modal function block" is at a location "modal location"
  And I bump modal blocks into view
  And block "modal function block" is at location "modal location"

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
