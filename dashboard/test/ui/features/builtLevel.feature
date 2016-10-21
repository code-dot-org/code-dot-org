Feature: Open a level built with level builder

Background:
  Given I am on "http://studio.code.org/s/course1/stage/4/puzzle/2"

@new_courses
Scenario: The level loads
  When I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 2 of 15"
  Then element "#codeWorkspace" is visible
