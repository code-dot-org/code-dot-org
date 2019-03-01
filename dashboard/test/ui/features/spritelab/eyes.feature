@eyes
@dashboard_db_access
@as_student
Feature: Sprite Lab Eyes

Scenario: Basic Sprite Lab level
  When I open my eyes to test "sprite lab eyes"
  And I start a new Sprite Lab project
  Then I see no difference for "initial load"
  And I close my eyes
