@eyes
Feature: Looking at a few things with Applitools Eyes - Part 1

  Background:
    Given I am on "http://studio.code.org/reset_session"

  @dashboard_db_access
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
      | http://studio.code.org/s/20-hour/stage/2/puzzle/1?noautoplay=true       | first maze level          |
      | http://studio.code.org/s/course2/stage/7/puzzle/2?noautoplay=true       | artist level              |
      | http://studio.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true      | playlab level             |
      | http://studio.code.org/s/course1/stage/3/puzzle/5?noautoplay=true       | jigsaw level              |
      | http://studio.code.org/s/course1/stage/18/puzzle/10?noautoplay=true     | course1 artist level      |
      | http://studio.code.org/s/allthethings/stage/3/puzzle/6?noautoplay=true  | auto open function editor |
      | http://studio.code.org/s/algebra/stage/10/puzzle/6?noautoplay=true      | auto open contract editor |
      | http://studio.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true       | auto open variable editor |
      | http://studio.code.org/s/allthethings/stage/24/puzzle/1?noautoplay=true | star wars                 |
      | http://studio.code.org/s/allthethings/stage/24/puzzle/2?noautoplay=true | star wars blocks          |
      | http://studio.code.org/s/allthethings/stage/25/puzzle/1?noautoplay=true | minecraft                 |
      | http://studio.code.org/s/course1/stage/11/puzzle/1?noautoplay=true      | wordsearch level          |
      | http://studio.code.org/s/mc/stage/1/puzzle/6                            | minecraft house dialog    |
