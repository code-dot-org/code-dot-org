Feature: Open a level built with level builder

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/4/levels/2"

Scenario: The level loads
  When I wait for the lab page to fully load
  Then element "#codeWorkspace" is visible
