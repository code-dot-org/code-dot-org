@eyes
@skip
Feature: Looking at a few things with Applitools Eyes - CSF Levels

  Background:
    Given I am on "http://studio.code.org/reset_session"

  Scenario Outline: Simple blockly level page view
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I wait for the lab page to fully load
    And I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                                     | test_name                 |
      | http://studio.code.org/courses/20-hour/units/1/lessons/2/levels/1?noautoplay=true       | first maze level          |
      | http://studio.code.org/courses/course2/units/1/lessons/7/levels/2?noautoplay=true       | artist level              |
      | http://studio.code.org/courses/playlab/units/1/lessons/1/levels/10?noautoplay=true      | playlab level             |
      | http://studio.code.org/courses/course1/units/1/lessons/3/levels/5?noautoplay=true       | jigsaw level              |
      | http://studio.code.org/courses/course1/units/1/lessons/18/levels/10?noautoplay=true     | course1 artist level      |
      | http://studio.code.org/courses/course1/units/1/lessons/11/levels/1?noautoplay=true      | wordsearch level          |
