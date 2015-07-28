@eyes
Feature: Applab Stuff

Scenario: Button shows up on top of canvas
  Given I am on "http://learn.code.org/"
  And I am a student
  When I open my eyes to test "applab button on top of canvas"
  And I am on "http://learn.code.org/p/applab"
  And I rotate to landscape
  And I see no difference for "initial load"
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  And I see no difference for "button should be visible"
  And I close my eyes
