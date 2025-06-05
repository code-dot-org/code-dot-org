@as_student
Feature: App Lab Scenarios 4

  Background:
    Given I start a new Applab project
    And I wait for the lab page to fully load

  Scenario: App Lab Clear Puzzle and Design Mode
    # Create an app with a design mode button, then clear the puzzle.
    Given I switch to design mode
    And I drag a BUTTON into the app
    And I switch to code mode
    And Applab HTML has a button
    And I reset the puzzle to the starting version
    And I wait to see "#divApplab"
    And I wait until element "#divApplab" is visible
    And Applab HTML has no button

