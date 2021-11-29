@eyes
Feature: Looking at a few things with Applitools Eyes - Part 1

  Background:
    Given I am on "http://studio.code.org/reset_session"

  Scenario Outline: Simple blockly level page view
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                                     | test_name                 |
      | http://studio.code.org/s/allthethings/lessons/3/levels/6?noautoplay=true  | auto open function editor |
      | http://studio.code.org/s/algebra/lessons/10/levels/6?noautoplay=true      | auto open contract editor |
      | http://studio.code.org/s/algebra/lessons/6/levels/4?noautoplay=true       | auto open variable editor |
      | http://studio.code.org/s/allthethings/lessons/24/levels/1?noautoplay=true | star wars                 |
      | http://studio.code.org/s/allthethings/lessons/24/levels/2?noautoplay=true | star wars blocks          |
      | http://studio.code.org/s/allthethings/lessons/25/levels/1?noautoplay=true | minecraft                 |
      | http://studio.code.org/s/mc/lessons/1/levels/6                            | minecraft house dialog    |
