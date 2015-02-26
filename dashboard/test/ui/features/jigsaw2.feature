Feature: Solving a jigsaw puzzle

Background:
  Given I am on "http://learn.code.org/s/course1/stage/3/puzzle/2?noautoplay=1"
  And I rotate to landscape
  Then I wait for a popup titled "Puzzle 2 of 12"
  And I close the popup

Scenario: Solving puzzle
  And I drag block "2" to block "1"
  Then I wait for a popup
  And element ".modal .congrats" contains text "You completed Puzzle 2"
