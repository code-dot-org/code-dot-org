@eyes
Feature: Looking at curriculum reference levels Applitools Eyes

  Background:
    Given I am on "http://studio.code.org/reset_session"

  Scenario Outline: Load iframe then take screenshot
    Given I am on "<url>"
    Then I rotate to landscape
    And I open my eyes to test "<test_name>"
    And I wait to see "#curriculum-reference"
    And I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                                     | test_name                  |
      | http://studio.code.org/s/allthethings/lessons/35/levels/1?noautoplay=true | curriculum reference level |
      | http://studio.code.org/s/allthethings/lessons/35/levels/2?noautoplay=true | map level                  |
