@eyes
Feature: Looking at Algebra levels with Applitools Eyes

Background:
  Given I am on "http://studio.code.org/reset_session"

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
