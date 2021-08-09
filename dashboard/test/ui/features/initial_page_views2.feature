@eyes
@eyes_ie
Feature: Looking at a few things with Applitools Eyes - Part 2

  Background:
    Given I am on "http://studio.code.org/reset_session"

  Scenario Outline: Logged in simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a <user_type>
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    And I close the instructions overlay if it exists
    # hack to deflake "free response" scenario below
    And element ".uitest-attachment" is not visible
    Then I see no difference for "initial load" using stitch mode "<stitch_mode>"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                      | test_name                         | stitch_mode | user_type |
      | http://studio.code.org/projects/applab/new               | new applab project                | none        | student   |
      | http://studio.code.org/                                  | logged in student studio homepage | css         | student   |
      | http://studio.code.org/                                  | logged in teacher studio homepage | css         | teacher   |
      | http://studio.code.org/s/allthethings                    | logged in script progress         | css         | student   |
      | http://studio.code.org/s/course4/lessons/1/levels/1        | unplugged video level             | css         | student   |
      | http://studio.code.org/s/allthethings/lessons/18/levels/14 | no iframe in dsl                  | css         | student   |
      | http://studio.code.org/s/allthethings/lessons/26/levels/1  | rich long assessment              | css         | student   |
      | http://studio.code.org/s/allthethings/lessons/27/levels/1  | free response                     | css         | student   |
