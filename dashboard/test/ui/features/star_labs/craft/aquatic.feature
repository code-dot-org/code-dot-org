Feature: Minecraft aquatic

  Background:
    Given I am on "http://studio.code.org/s/allthethings/lessons/25/levels/3"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait until the Minecraft game is loaded
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Winning the first level
    And I press "runButton"
    And element "#resetButton" is visible
    And I wait until element ".congrats" is visible
