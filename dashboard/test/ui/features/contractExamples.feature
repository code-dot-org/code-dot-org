Feature: Editing examples in the contract editor

Background: Testing example add and removal
  Given I am on "http://learn.code.org/s/ui_tests/stage/1/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

  When I open the topmost blockly category "Functions"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"

  When "first example" refers to the open contract editor example 0
  When "second example" refers to the open contract editor example 1
  When "function definition" refers to the open contract editor function definition

@no_ie
Scenario: Dragging an example to delete it
  When the contract editor has 2 examples
  And I drag block "first example" to offset "-2000, -2000"
  Then block "first example" has been deleted
  And the contract editor has 1 example

Scenario: Pressing the "add example" button should add an example
  When the contract editor has 2 examples
  And I press the SVG text "Add Example"
  And the contract editor has 3 examples

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
