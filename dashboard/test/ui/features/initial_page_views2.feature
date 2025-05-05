@eyes
Feature: Looking at a few things with Applitools Eyes - Part 2

  Background:
    Given I am on "http://studio.code.org/reset_session"

  @properties_encryption_key
  Scenario Outline: Logged in simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a <user_type>
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I close the instructions overlay if it exists
    Then I see no difference for "initial load" in the current viewport
    And I close my eyes
    And I sign out
    Examples:
      | url                                        | test_name          | user_type |
      | http://studio.code.org/projects/applab/new | new applab project | student   |

  @properties_encryption_key
  Scenario Outline: Logged in full page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a <user_type>
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I close the instructions overlay if it exists
    # hack to deflake "free response" scenario below
    And element ".uitest-attachment" is not visible
    Then I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                        | test_name                         | user_type |
      | http://studio.code.org/                                    | logged in student studio homepage | student   |
      | http://studio.code.org/                                    | logged in teacher studio homepage | teacher   |
      | http://studio.code.org/s/allthethings                      | logged in script progress         | student   |
      | http://studio.code.org/s/course4/lessons/1/levels/1        | unplugged video level             | student   |
      | http://studio.code.org/s/allthethings/lessons/18/levels/14 | no iframe in dsl                  | student   |
      | http://studio.code.org/s/allthethings/lessons/26/levels/1  | rich long assessment              | student   |
      | http://studio.code.org/s/allthethings/lessons/27/levels/1  | free response                     | student   |
