@eyes
Feature: Looking at a few things with Applitools Eyes

Background:
  Given I am on "http://learn.code.org/reset_session"

Scenario:
  When I open my eyes to test "bounce game"
  And I am on "http://learn.code.org/2014/1?noautoplay=true"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I wait to see "#x-close"
  And I close the dialog
  And I see no difference for "closed dialog"
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I see no difference for "block snap"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "level completion"
  And I close my eyes

Scenario:
  When I open my eyes to test "freeplay artist sharing"
  And I am on "http://studio.code.org/s/course3/stage/21/puzzle/15?noautoplay=true"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I close the dialog
  And I see no difference for "closed dialog"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "freeplay artist level completion"
  And I close my eyes


Scenario:
  When I open my eyes to test "freeplay playlab sharing"
  And I am on "http://studio.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I close the dialog
  And I see no difference for "closed dialog"
  And I press "runButton"
  And I press "finishButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "freeplay playab level completion"
  And I close my eyes

Scenario:
  When I open my eyes to test "multi"
  Given I am on "http://learn.code.org/s/course1/stage/2/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "match"
  Given I am on "http://learn.code.org/s/course1/stage/14/puzzle/13?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text-only match"
  Given I am on "http://learn.code.org/s/course3/stage/10/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text compression"
  Given I am on "http://learn.code.org/s/allthethings/stage/16/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I set text compression dictionary to "pitter\npatter\n"
  And I see no difference for "simple substitution"
  And I close my eyes

Scenario:
  When I open my eyes to test "pixelation with range"
  Given I am on "http://learn.code.org/s/allthethings/stage/17/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "maze"
  Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "maze feedback with blocks"

  Then I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/1/lang/ar-sa?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I wait to see "#runButton"
  And I see no difference for "maze RTL"
  Given I am on "http://learn.code.org/reset_session/lang/en"
  And I wait for 2 seconds
  And I close my eyes

@dashboard_db_access
Scenario:
  Given I am a student
  And I open my eyes to test "embedded ninjacat"
  When I am on "http://learn.code.org/s/algebra/stage/1/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element "#runButton" is visible
  And I see no difference for "level load"
  And I close the dialog
  And I see no difference for "closed dialog"

  Then I press "runButton"
  And I wait to see "#finishButton"
  And I press "finishButton"
  And I see no difference for "finish dialog"
  And I close my eyes
  And I sign out

@dashboard_db_access
Scenario:
  Given I am a student
  And I open my eyes to test "calc expression evaluation"
  When I am on "http://learn.code.org/s/algebra/stage/2/puzzle/6?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I press ".tooltip-x-close" using jQuery
  And I've initialized the workspace with the solution blocks
  Then I see no difference for "level load, closed dialog"

  When I press "runButton"
  And I wait to see "#x-close"
  Then I see no difference for "evaluated expression"
  And I close my eyes
  And I sign out

@dashboard_db_access
Scenario:
  Given I am a student
  And I open my eyes to test "calc variable"
  When I am on "http://learn.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I close the dialog
  And I press "modalEditorClose"
  And I've initialized the workspace with the solution blocks
  Then I see no difference for "level load, closed dialog"

  When I press "runButton"
  And I wait to see "#x-close"
  Then I see no difference for "evaluated expression"
  And I close my eyes
  And I sign out

@dashboard_db_access
Scenario Outline: Simple blockly level page view
  Given I am on "http://learn.code.org/"
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
  | http://learn.code.org/s/20-hour/stage/2/puzzle/1?noautoplay=true      | first maze level          |
  | http://learn.code.org/s/course2/stage/7/puzzle/2?noautoplay=true      | artist level              |
  | http://learn.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true     | playlab level             |
  | http://learn.code.org/s/course1/stage/3/puzzle/5?noautoplay=true      | jigsaw level              |
  | http://learn.code.org/s/course1/stage/18/puzzle/10?noautoplay=true    | course1 artist level      |
  | http://learn.code.org/s/allthethings/stage/3/puzzle/6?noautoplay=true | auto open function editor |
  | http://learn.code.org/s/algebra/stage/10/puzzle/6?noautoplay=true     | auto open contract editor |
  | http://learn.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true      | auto open variable editor |
  | http://learn.code.org/s/allthethings/stage/23/puzzle/1?noautoplay=true | star wars |
  | http://learn.code.org/s/allthethings/stage/23/puzzle/2?noautoplay=true | star wars blocks |
  | http://learn.code.org/s/allthethings/stage/24/puzzle/1?noautoplay=true | minecraft |

@dashboard_db_access
Scenario Outline: Logged in simple page view without instructions dialog
  Given I am on "http://learn.code.org/"
  And I am a student
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://learn.code.org/projects/applab/new                         | new applab project         |
  | http://hourofcode.com/us                                          | hourofcode.com us          |
  | http://hourofcode.com/br                                          | hourofcode.com br          |
  | http://code.org/                                                  | code.org homepage          |
  | http://studio.code.org/                                           | logged in studio homepage  |
  | http://studio.code.org/s/allthethings                             | logged in script progress  |
  | https://studio.code.org/s/allthethings/stage/13/puzzle/3?noautoplay=true | embedded blocks     |

Scenario Outline: Logged out simple page view without instructions dialog
  Given I am on "http://learn.code.org/"
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
Examples:
  | url                                                               | test_name                    |
  | http://hourofcode.com/us                                          | logged out hourofcode.com us |
  | http://hourofcode.com/br                                          | logged out hourofcode.com br |
  | http://code.org/                                                  | logged out code.org homepage |
  | http://studio.code.org/                                           | logged out studio homepage   |
  | http://studio.code.org/s/allthethings                             | logged out script progress   |
