Feature: Solving a jigsaw puzzle

Background:
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/1/levels/2?noautoplay=1"
  And I wait for the lab page to fully load

Scenario: Solving puzzle
  And I connect block "jigsaw_3B" to block "jigsaw_3A"
  Then I wait to see ".modal"
  And element ".modal .congrats" contains text "You have completed the final puzzle."
