@eyes
Feature: Looking at a few things with Applitools Eyes

Background:
  Given I am on "http://studio.code.org/reset_session"

Scenario:
  When I open my eyes to test "multi"
  Given I am on "http://studio.code.org/s/course1/lessons/2/levels/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "match"
  Given I am on "http://studio.code.org/s/course1/lessons/14/levels/13?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text-only match"
  Given I am on "http://studio.code.org/s/course3/lessons/10/levels/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "text compression"
  Given I am on "http://studio.code.org/s/allthethings/lessons/16/levels/1?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I set text compression dictionary to "pitter\npatter\n"
  And I see no difference for "simple substitution"
  And I close my eyes

Scenario:
  When I open my eyes to test "pixelation with range"
  Given I am on "http://studio.code.org/s/allthethings/lessons/17/levels/2?noautoplay=true"
  And I rotate to landscape
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "maze"
  Given I am on "http://studio.code.org/s/allthethings/lessons/2/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  And I wait until element ".uitest-topInstructions-inline-feedback" is visible
  And element ".uitest-topInstructions-inline-feedback" is visible
  And I see no difference for "maze feedback with blocks"

  Then I am on "http://studio.code.org/s/allthethings/lessons/2/levels/1/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "maze RTL"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds
  And I close my eyes

Scenario:
  When I open my eyes to test "star wars RTL"
  Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/15/lang/ar-sa?noautoplay=true"
  And I rotate to landscape
  And I wait to see ".header_user"
  And I wait to see "#runButton"
  # close the video dialog, because the noautoplay param may be lost in the
  # language redirect
  And I press "x-close"
  And I close the instructions overlay if it exists
  And I see no difference for "star wars RTL"
  And I press "show-code-header"
  And I see no difference for "star wars RTL text mode" using stitch mode "none"
  And I close my eyes
