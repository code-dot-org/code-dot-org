@eyes
Feature: Opening the contract editor

Scenario: Testing the contract variable editor
  When I open my eyes to test "contract variable editor"
  Given I am on "http://learn.code.org/s/algebra/stage/7/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  And I see no difference for "blank game screen"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  When I open the topmost blockly category "Variables"
  And I see no difference for "category view"
  And I press the SVG text "Create a Variable"
  And I wait to see "#modalEditorClose"
  And I see no difference for "new variable editor"
  And I press dropdown button with text "Number"
  And I see no difference for "type dropdown opened"
  And I press dropdown item with text "Image"
  And I see no difference for "variable type changed"
  When I open the topmost blockly category "Variables"
  And I see no difference for "opened up variables category"
  And I close my eyes

Scenario: Creating and modifying a new contract
  When I open my eyes to test "creating a new contract"
  Given I am on "http://learn.code.org/s/algebra/stage/7/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  And I see no difference for "blank game screen"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  When I open the topmost blockly category "Functions"
  And I see no difference for "category view"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"
  And I see no difference for "new function editor"

  And I press dropdown button with text "Number"
  And I see no difference for "type dropdown opened"
  And I press dropdown item with text "Image"
  And I see no difference for "variable type changed"

  And I press "paramAddButton"
  And I see no difference for "new domain added"
  And I press dropdown button with text "Number"
  And I see no difference for "domain dropdown opened"
  And I press dropdown item with text "String"
  And I see no difference for "domain changed"

  And I press "paramAddButton"
  And I see no difference for "two params"

  And I press the last button with text "x"
  And I see no difference for "domain removed"

  And I open the topmost blockly category "Functions"
  And I see no difference for "opened up functions category"

  And I press the edit button on a function call named "something"
  And I see no difference for "opened self from the contract editor"

  And I close my eyes
