@as_student
Feature: Sprite Lab Loading Animations

  Scenario: Load the project with default animations and load Piskel
    Given I start a new Sprite Lab project
    And I switch to the animation tab
    And I wait for the lab page to fully load
    And I switch to the first iframe
    And element ".icon-tool-pen" is visible
    And I switch to the default content
    And I switch to the code tab in Game Lab
    And I press "runButton"
