@eyes
Feature: Artist Autorun

Scenario: Autorun Eyes Test
  When I open my eyes to test "artist autorun"
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/3/levels/9"
  And I wait to see "#runButton"
  And I close the instructions overlay if it exists
  Then I see no difference for "square already drawn"
  When I've initialized the workspace with the artist_autorun blocks
  Then I see no difference for "two squares drawn"
  And I close my eyes
