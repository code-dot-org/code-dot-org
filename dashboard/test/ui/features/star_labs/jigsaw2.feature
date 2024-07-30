Feature: Solving a jigsaw puzzle

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/3/levels/2?noautoplay=1"
  And I wait for the lab page to fully load

Scenario: Solving puzzle
  And I drag block "2" to block "1"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You completed Puzzle 2"
