# Temporarily skip this test to unblock Drone builds. See ticket for details:
# https://codedotorg.atlassian.net/browse/SL-288
@skip
Feature: Minecraft aquatic

  Background:
    Given I am on "http://studio.code.org/s/allthethings/lessons/25/levels/3"
    And I wait for the lab page to fully load
    And I wait until the Minecraft game is loaded
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Winning the first level
    And I press "runButton"
    And element "#resetButton" is visible
    And I wait until element ".congrats" is visible
