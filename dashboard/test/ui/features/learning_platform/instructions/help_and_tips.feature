@no_mobile
Feature: Help and Tips Map Link

  Background:
    Given I create a student named "Lillian"

  Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
    Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/18"
    And I wait for the page to fully load
    When I click selector ".uitest-helpTab" once I see it
    And I wait until ".editor-column" contains text "Circuit Playground"
    When I click selector "a:contains(Circuit Playground)"
    And I wait until element ".instructions-container" is visible
    And I switch to the first iframe
    And I wait for 1 seconds
    And I wait until element ".documentation-ui-test" is visible
    And I wait until ".content" contains text "Circuit Playground"
    And I wait until ".content" contains text "The Light Emitting Diode (LED)"

