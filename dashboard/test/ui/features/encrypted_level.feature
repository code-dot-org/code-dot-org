Feature: Encrypted Level

Scenario: Load Encrypted Play Lab Level
  When I am on "http://studio.code.org/s/allthethings/stage/5/puzzle/6"
  And I wait until element "#runButton" is visible
  Then element "#leftButton" is visible

