Feature: Editing examples in the contract editor

Background: Testing example add and removal
  Given I am on "http://learn.code.org/s/algebra/stage/7/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

  When I open the topmost blockly category "Functions"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"

  And "first example" refers to block "118"
  And "first example call" refers to block "119"
  And "second example" refers to block "120"
  And "second example call" refers to block "121"

  And "function definition" refers to block "117"

@no_ie
Scenario: Dragging an example to delete it
  When the contract editor has 2 examples
  And I drag block "first example" to offset "-2000, -2000"
  Then block "first example" has been deleted
  And the contract editor has 1 example

@no_mobile
Scenario: Expected failure to hotkey-delete function definition block
  When I click block "function definition"
  And I press delete
  Then block "function definition" has not been deleted

@no_mobile
Scenario: Deleting an example block via delete key
  When I click block "second example"
  And the contract editor has 2 examples
  And I press delete
  Then block "second example" has been deleted
  And the contract editor has 1 example
