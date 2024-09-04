@no_mobile
Feature: Level Group Activity Guide

@as_student
Scenario: Submit activity guide and go to next level.
  Given I am on "http://studio.code.org/s/allthethings/lessons/53/levels/1"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  And I press ".submitButton:first" using jQuery
  Then I wait until I am on a different page than I noted before