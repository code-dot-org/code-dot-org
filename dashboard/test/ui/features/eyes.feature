@eyes
Feature: Looking at a few things with Applitools Eyes

Background:
  Given I am on "http://studio.code.org/reset_session"

Scenario:
  When I open my eyes to test "bounce game"
  And I am on "http://studio.code.org/s/events/stage/1/puzzle/1?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "initial load"
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
  And I wait for the page to fully load
  And I see no difference for "initial load"
  And I press "runButton"
  And I press "finishButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "freeplay artist level completion"
  And I close my eyes


Scenario:
  When I open my eyes to test "freeplay playlab sharing"
  And I am on "http://studio.code.org/s/playlab/stage/1/puzzle/10?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "initial load"
  And I press "runButton"
  And I press "finishButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "freeplay playab level completion"
  And I close my eyes

Scenario:
  When I open my eyes to test "multi"
  Given I am on "http://studio.code.org/s/course1/stage/2/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "match"
  Given I am on "http://studio.code.org/s/course1/stage/14/puzzle/13?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text-only match"
  Given I am on "http://studio.code.org/s/course3/stage/10/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text compression"
  Given I am on "http://studio.code.org/s/allthethings/stage/16/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I set text compression dictionary to "pitter\npatter\n"
  And I see no difference for "simple substitution"
  And I close my eyes

Scenario:
  When I open my eyes to test "pixelation with range"
  Given I am on "http://studio.code.org/s/allthethings/stage/17/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "maze"
  Given I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And I see no difference for "maze feedback with blocks"

  Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "maze RTL"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds
  And I close my eyes

Scenario:
  When I open my eyes to test "star wars RTL"
  Given I am on "http://studio.code.org/s/starwars/stage/1/puzzle/15/lang/ar-sa?noautoplay=true"
  And I rotate to landscape
  And I wait to see ".header_user"
  And I wait to see "#runButton"
  # close the video dialog, because the noautoplay param may be lost in the
  # language redirect
  And I press "x-close"
  And I close the instructions overlay if it exists
  And I see no difference for "star wars RTL"
  And I press "show-code-header"
  And I see no difference for "star wars RTL text mode"
  And I close my eyes

@dashboard_db_access
Scenario:
  Given I am a student
  And I open my eyes to test "embedded ninjacat"
  When I am on "http://studio.code.org/s/algebra/stage/1/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#runButton" is visible
  And I see no difference for "level load"

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
  When I am on "http://studio.code.org/s/algebra/stage/2/puzzle/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
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
  When I am on "http://studio.code.org/s/algebra/stage/6/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "modalEditorClose"
  And I've initialized the workspace with the solution blocks
  Then I see no difference for "level load, closed dialog"

  When I press "runButton"
  And I wait to see "#x-close"
  Then I see no difference for "evaluated expression"
  And I close my eyes
  And I sign out
