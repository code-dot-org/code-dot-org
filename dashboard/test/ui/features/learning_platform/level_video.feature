@eyes
Feature: Related video on level

@as_student
Scenario: Sprite lab level
  Given I am on "http://studio.code.org/s/allthethings/lessons/36/levels/2"
  When I open my eyes to test "sprite lab level"
  And I wait to see "#belowVisualization"
  And I see no difference for "sprite lab level with related video"
  And I close my eyes