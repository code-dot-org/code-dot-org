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

Scenario: Changing Parameter names
  When I open my eyes to test "changing contract parameters"
  Given I am on "http://learn.code.org/s/algebra/stage/8/puzzle/3?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  And I press "modalEditorClose"
  When I open the topmost blockly category "Functions"
  And I press the SVG text "Create a Function"
  And I press "paramAddButton"
  And I press "paramAddButton"
  And I see no difference for "added two variables"

  Then I open the topmost blockly category "Number"
  And I drag block "36" to block "32"
  And I drag block "34" to block "41"
  And I drag block "35" to block "41" plus offset 60, 40
  And I see no difference for "used variables in definition"

  Then I press keys ":backspace" for element "#domain-area input"
  Then I press keys "radius" for element "#domain-area input"
  And I see no difference for "changed one variable"

  Then I press "modalEditorClose"
  And I open the topmost blockly category "Functions"
  And I drag block "62" to block "10" plus offset 0, 100
  And I see no difference for "two blocks have same name params"

  Then I open the topmost blockly category "Functions"
  And I press the edit button on a function call named "something"
  And I press keys "2" for element "#domain-area input"
  And I press "modalEditorClose"
  And I see no difference for "only one function's radius param changed"
  And I close my eyes
