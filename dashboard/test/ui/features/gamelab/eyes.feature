@eyes
@dashboard_db_access
@as_student
Feature: Game Lab Eyes

Scenario: Basic GameLab level
  When I open my eyes to test "gamelab eyes"
  And I start a new Game Lab project
  Then I see no difference for "initial load"
  And I press "animationMode"
  Then I see no difference for "animation tab"
  And I press ".animationList .newListItem" using jQuery
  Then I see no difference for "new animation"
  And I close my eyes
