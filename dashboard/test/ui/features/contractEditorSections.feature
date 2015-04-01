Feature: Contract Editor Sections

Background:
  Given I am on "http://learn.code.org/s/algebra/stage/7/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"
  Then element "#runButton" is visible
  And I open the blockly category with ID "7"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"

Scenario: Examples should be hidden when specified in contract editor
  And examples are visible
  And the "Contract and Purpose Statement" contract editor header is visible
  And the "Examples" contract editor header is visible
  And the "Definition" contract editor header is visible

  And I press "modalEditorClose"
  And I configure the contract editor to disable examples

  And I open the blockly category with ID "7"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"
  And there are no visible examples
  And the "Contract and Purpose Statement" contract editor header is visible
  And the "Examples" contract editor header isn't visible
  And the "Definition" contract editor header is visible

  And I open the blockly category with ID "f"
  And I press the edit button on a function call named "something"
  And there are no visible examples
  And the "Examples" contract editor header isn't visible

Scenario: Expanding / collapsing sections should persist across function openings
  Then element ".contractEditor" is visible
  When I press the contract editor header "Contract and Purpose Statement"
  Then element ".contractEditor" is hidden

  And I press "modalEditorClose"

  And I open the blockly category with ID "7"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"

  Then element ".contractEditor" is hidden

Scenario: Opening a variable then a function should show proper headers
  And I press "modalEditorClose"

  And I open the blockly category with ID "6"
  And I press the SVG text "Create a Variable"
  And the "Definition" contract editor header is invisible
  And the "Contract and Purpose Statement" contract editor header is invisible
  And I wait to see "#modalEditorClose"
  And I press "modalEditorClose"

  And I open the blockly category with ID "7"
  And I press the SVG text "Create a Function"
  And I wait to see "#modalEditorClose"

  And the "Definition" contract editor header is visible
  And the "Examples" contract editor header is visible
  And the "Contract and Purpose Statement" contract editor header is visible

  And element ".contractEditor" is visible
