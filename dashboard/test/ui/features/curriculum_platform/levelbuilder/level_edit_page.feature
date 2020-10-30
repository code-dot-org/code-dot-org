# We need "press keys" to type into the React form's fields, but that doesn't work on IE.
@no_ie
@no_mobile
Feature: Using the Level Edit Page

  Scenario: Update a Multi level
    Given I create a levelbuilder named "Levi"
    And I create a temp multi level
    And I check I am on the temp level edit page
    And I press keys "wrong 'incorrect answer'" for element "#level_dsl_text"
    And I click "input[type='submit']" to load a new page
    And I check I am on the temp level show page
    And element "body" contains text "incorrect answer"
    And I delete the temp level




