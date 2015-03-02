Feature: Opening the function editor

Background:
  Given I am on "http://learn.code.org/s/course4/stage/14/puzzle/12?noautoplay=true"
  And I rotate to landscape
  Then element ".dialog-title" has text "Puzzle 12 of 15"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Opening the function editor
  When I press SVG selector ".blocklyIconGroup:contains(edit)"
  And I wait to see "#modalEditorClose"
