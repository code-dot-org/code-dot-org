@eyes
Feature: Looking at a few things with Applitools Eyes

  Background:
    Given I am on "http://studio.code.org/reset_session"

  @dashboard_db_access
  Scenario Outline: Simple blockly level page view
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    And I see no difference for "initial load"
    And I wait to see "#x-close"
    And I close the dialog
    And I see no difference for "closed dialog"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                                   | test_name                 |
      | http://studio.code.org/s/20-hour/stage/2/puzzle/1?noautoplay=true      | first maze level          |
      | http://studio.code.org/s/course2/stage/7/puzzle/2?noautoplay=true      | artist level              |
      | http://studio.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true     | playlab level             |
      | http://studio.code.org/s/course1/stage/3/puzzle/5?noautoplay=true      | jigsaw level              |
      | http://studio.code.org/s/course1/stage/18/puzzle/10?noautoplay=true    | course1 artist level      |
      | http://studio.code.org/s/allthethings/stage/3/puzzle/6?noautoplay=true | auto open function editor |
      | http://studio.code.org/s/algebra/stage/10/puzzle/6?noautoplay=true     | auto open contract editor |
      | http://studio.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true      | auto open variable editor |
      | http://studio.code.org/s/allthethings/stage/24/puzzle/1?noautoplay=true | star wars |
      | http://studio.code.org/s/allthethings/stage/24/puzzle/2?noautoplay=true | star wars blocks |
      | http://studio.code.org/s/allthethings/stage/25/puzzle/1?noautoplay=true | minecraft |
      | http://studio.code.org/s/course1/stage/11/puzzle/1?noautoplay=true      | wordsearch level |

  @dashboard_db_access
  Scenario Outline: Logged in simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                               | test_name                  |
      | http://studio.code.org/projects/applab/new                         | new applab project         |
      | http://studio.code.org/                                           | logged in studio homepage  |
      | http://studio.code.org/s/allthethings                             | logged in script progress  |
      | http://studio.code.org/s/course4/stage/1/puzzle/1                  | unplugged video level |
      | http://studio.code.org/s/mc/stage/1/puzzle/6                       | minecraft house dialog     |
      | http://studio.code.org/s/allthethings/stage/18/puzzle/14           | embed video |

  @no_circle
  @dashboard_db_access
  Scenario Outline: Temporarily circle disabled simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                               | test_name                  |
      | http://code.org/                                                  | code.org homepage          |
      | https://studio.code.org/s/allthethings/stage/13/puzzle/3?noautoplay=true | embedded blocks     |

  Scenario Outline: Logged out simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    Examples:
      | url                                                               | test_name                    |
      | http://studio.code.org/                                           | logged out studio homepage   |
      | http://studio.code.org/s/allthethings                             | logged out script progress   |

  @no_circle
  Scenario Outline: Temporarily eyes disabled simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    Examples:
      | url                                                               | test_name                    |
      | http://code.org/?lock-hero=true                                   | logged out code.org homepage |
