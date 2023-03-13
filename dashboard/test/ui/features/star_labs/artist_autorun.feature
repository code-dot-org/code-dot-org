@eyes
Feature: Artist Autorun

Scenario: Autorun Eyes Test
  When I open my eyes to test "artist autorun"
  Given I am on "http://studio.code.org/s/allthethings/lessons/3/levels/9"
  And I wait to see "#runButton"
  And I close the instructions overlay if it exists
  Then I see no difference for "square already drawn"
  When I drag block "2" to block "12"
  And I drag block "6" to block "17"
  Then I see no difference for "two squares drawn"
  And I close my eyes
