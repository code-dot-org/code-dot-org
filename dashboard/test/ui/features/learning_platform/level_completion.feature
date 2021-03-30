@eyes
Feature: Looking at completing different level types

Background:
  Given I am on "http://studio.code.org/reset_session"

Scenario:
  When I open my eyes to test "bounce game"
  And I am on "http://studio.code.org/s/events/lessons/1/levels/1?noautoplay=true"
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
  And I am on "http://studio.code.org/s/course3/lessons/21/levels/15?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And I see no difference for "initial load"
  And I press "runButton"
  And I press "finishButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "freeplay artist level completion"
  And I close my eyes

Scenario:
  When I open my eyes to test "freeplay playlab sharing"
  And I am on "http://studio.code.org/s/playlab/lessons/1/levels/10?noautoplay=true"
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
