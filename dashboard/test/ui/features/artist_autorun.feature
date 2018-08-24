@eyes
Feature: Artist Autorun

Scenario: Autorun Eyes Test
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/9"
  And I wait to see "#runButton"
  And I open my eyes to test "artist autorun"
  Then I see no difference for "square already drawn"
  And I close my eyes
