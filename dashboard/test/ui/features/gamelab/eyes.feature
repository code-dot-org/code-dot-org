@eyes
@dashboard_db_access
@as_student
Feature: Game Lab Eyes

Scenario: Basic GameLab level
  When I open my eyes to test "gamelab eyes"
  And I am on "http://learn.code.org/projects/gamelab/new"
  And I rotate to landscape
  And I wait to see "#runButton"
  Then I see no difference for "initial load"
  And I press "animationMode"
  Then I see no difference for "animation tab"
  And I press ".animationList .newListItem" using jQuery
  Then I see no difference for "new animation"
  And I close my eyes
