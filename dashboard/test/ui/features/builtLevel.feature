Feature: Open a level built with level builder

Background:
  Given I am on "http://studio.code.org/s/course1/stage/4/puzzle/2"

Scenario: The level loads
  When I rotate to landscape
  And I wait for the page to fully load
  Then element "#codeWorkspace" is visible
