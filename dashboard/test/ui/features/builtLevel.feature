Feature: Open a level built with level builder

Background:
  Given I am on "http://learn.code.org/s/course1/stage/4/puzzle/2"

@new_courses
Scenario: The level loads
  When I rotate to landscape
  Then element "#blockly" is visible
