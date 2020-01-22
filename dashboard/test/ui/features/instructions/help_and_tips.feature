@no_mobile
@single_session
Feature: Help and Tips Map Link

  Background:
    Given I create a student named "Lillian"

  Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/18"
    And I wait for the page to fully load
    When I click selector ".uitest-helpTab" once I see it
    And I wait until ".editor-column" contains text "The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore."
    When I click selector "a:contains(The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore.)"
    And I wait until element ".instructions-container" is visible
    And I switch to the first iframe
    And I wait for 1 seconds
    And I wait until element ".container" is visible
    And I wait until ".content" contains text "Welcome to the Circuit Playground"
