@no_mobile
Feature: Level Group Activity Guide

@as_student
Scenario: Submit activity guide and go to next level.
  Given I am on "http://studio.code.org/s/allthethings/lessons/33/levels/2"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  And I press ".submitButton:first" using jQuery
  And I am on "http://studio.code.org/s/allthethings/lessons/34/levels/1"