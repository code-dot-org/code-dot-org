@eyes
Feature: Looking at a few things with Applitools Eyes

Scenario:
  When I open my eyes to test "bounce game"
  And I am on "http://learn.code.org/2014/1?noautoplay=true"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I wait to see "#x-close"
  And I press "x-close"
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
  When I open my eyes to test "embedded ninjacat"
  Given I am on "http://learn.code.org/s/algebra/stage/1/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element "#runButton" is visible
  And I see no difference for "level load"
  And I wait to see "#x-close"
  And I press "x-close"
  And I see no difference for "closed dialog"

  Then I press "runButton"
  And I wait to see "#finishButton"
  And I press "finishButton"
  And I see no difference for "finish dialog"
  And I close my eyes

Scenario:
  When I open my eyes to test "calc expression evaluation"
  Given I am on "http://learn.code.org/s/algebra/stage/2/puzzle/6?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I press ".tooltip-x-close" using jQuery
  And I've initialized the workspace with the solution blocks
  And I see no difference for "level load, closed dialog"

  Then I press "runButton"
  And I wait to see "#x-close"
  And I see no difference for "evaluated expression"
  And I close my eyes

Scenario:
  When I open my eyes to test "calc variable"
  Given I am on "http://learn.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  And I press "modalEditorClose"
  And I've initialized the workspace with the solution blocks
  And I see no difference for "level load, closed dialog"

  Then I press "runButton"
  And I wait to see "#x-close"
  And I see no difference for "evaluated expression"
  And I close my eyes

Scenario Outline: Simple blockly level page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I wait to see "#x-close"
  And I press "x-close"
  And I see no difference for "closed dialog"
  And I close my eyes
Examples:
  | url                                                                | test_name                 |
  | http://learn.code.org/s/1/level/2?noautoplay=true                  | first maze level          |
  | http://learn.code.org/s/course2/stage/7/puzzle/2?noautoplay=true   | artist level              |
  | http://learn.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true  | playlab level             |
  | http://learn.code.org/s/course1/stage/3/puzzle/5?noautoplay=true   | jigsaw level              |
  | http://learn.code.org/s/course1/stage/18/puzzle/10?noautoplay=true | course1 artist level      |
  | http://learn.code.org/s/course4/stage/15/puzzle/10?noautoplay=true | auto open function editor |
  | http://learn.code.org/s/msm/stage/10/puzzle/5?noautoplay=true      | auto open contract editor |
  | http://learn.code.org/s/msm/stage/6/puzzle/6?noautoplay=true       | auto open variable editor |
