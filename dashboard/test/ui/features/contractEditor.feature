@dashboard_db_access
@as_student
@eyes
Feature: Opening the contract editor

Scenario: Testing the contract variable editor
  When I open my eyes to test "contract variable editor"
  Given I am on "http://learn.code.org/s/algebra/stage/7/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I see no difference for "blank game screen"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  When I close the React alert
  And I open the topmost blockly category "Variables"
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
  And I close the dialog
  And I see no difference for "blank game screen"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  When I close the React alert
  And I open the topmost blockly category "Functions"
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

  And I press the last button with text "Remove"
  And I see no difference for "domain removed"

  And I open the topmost blockly category "Functions"
  And I see no difference for "opened up functions category"

  And I press the edit button on a function call named "something"
  And I see no difference for "opened self from the contract editor"

  And I close my eyes

Scenario: Changing Parameter names
  Given "add-block-template" refers to block "36"
  And "function-definition" refers to block "32"
  And "add-block" refers to block "41"
  And "i" refers to block "34"
  And "j" refers to block "35"
  And "do-something" refers to block "62"
  And "evaluate" refers to block "10"

  When I open my eyes to test "changing contract parameters"
  Given I am on "http://learn.code.org/s/allthethings/stage/13/puzzle/11?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I press "modalEditorClose"

  When I open the topmost blockly category "Functions"
  And I press the SVG text "Create a Function"
  And I press "paramAddButton"
  And I press "paramAddButton"
  And I see no difference for "added two variables"

  Then I open the topmost blockly category "Number"
  And I drag block "add-block-template" to block "function-definition"
  And I drag block "i" to block "add-block"
  And I drag block "j" to block "add-block" plus offset 60, 40
  And I see no difference for "used variables in definition"

  Then I press keys ":backspace" for element "#domain-area input"
  Then I press keys "radius" for element "#domain-area input"
  And I see no difference for "changed one variable"

  Then I press "modalEditorClose"
  And I open the topmost blockly category "Functions"
  And I drag block "do-something" to block "evaluate" plus offset 0, 100
  And I see no difference for "two blocks have same name params"

  Then I open the topmost blockly category "Functions"
  And I press the edit button on a function call named "something"
  And I press keys "2" for element "#domain-area input"
  And I press "modalEditorClose"
  And I see no difference for "only one function's radius param changed"
  And I close my eyes
