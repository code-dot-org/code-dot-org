@dashboard_db_access
@as_student
Feature: Game Lab Level Options

Scenario: A level with the animation tab disabled
  Given I am on the 1st Game Lab test level
  # A level with no animation mode should not show the code mode button either,
  # since no toggling between modes is possible.
  Then element "#codeMode" does not exist
  And element "#animationMode" does not exist

Scenario: A level with the animation tab enabled
  Given I am on the 2nd Game Lab test level
  # Both code and animation mode buttons appear when the animation tab is enabled.
  Then I see "#codeMode"
  And I see "#animationMode"

Scenario: A new project
  Given I start a new Game Lab project
  # A project should always make the animation tab available.
  Then I see "#codeMode"
  And I see "#animationMode"
