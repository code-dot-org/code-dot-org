@no_mobile
@single_session
Feature: CSP Instructions

Background:
  Given I create a student named "Lillian"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if level has videos
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1"
  And I wait for the page to fully load
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "Turtle Programming"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/18"
  And I wait for the page to fully load
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "Circuit Playground"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has reference links
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/19"
  And I wait for the page to fully load
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore."
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: Do not display resources tab when there are no videos, map references, or reference links
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/3"
  And I wait for the page to fully load
  And element ".uitest-helpTab" is not visible

Scenario: Resources tab displays videos, map references, and reference links with correct text and link
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/20"
  And I wait for the page to fully load
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "App Lab - Make It Interactive"
  And I wait until ".editor-column" contains text "Welcome to the Circuit Playground"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"
  
Scenario: Instructions can be collapsed and expanded
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/20"
  And I wait for the page to fully load
  And I press "ui-test-collapser"
  And element ".instructions-markdown" is hidden
  And I press "ui-test-collapser"
  And element ".instructions-markdown" is visible

Scenario: Instructions have a resizer for non-embedded levels
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/20"
  And I wait for the page to fully load
  And element "#ui-test-resizer" is visible

Scenario: Instructions do not show a resizer on embedded levels
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/12"
  And I wait for the page to fully load
  And element "#ui-test-resizer" is not visible

Scenario: Resources tab is clickable and displays correct text for contained levels
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I wait for the page to fully load
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "Welcome to the Circuit Playground"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" does not contain text "Welcome to the Circuit Playground"
