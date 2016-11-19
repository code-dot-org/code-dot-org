@no_mobile
Feature: Puzzle share page

Background:
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I wait for the page to fully load
  And I close the instructions overlay if it exists
  And I've initialized the workspace with my flappy puzzle.

Scenario: Share a flappy game, visit the share page, and visit the workspace
  Then I press "runButton"
  Then I press "rightButton"
  And I wait to see "#x-close"
  Then I navigate to the share URL

  Then ensure Flappy gameState is WAITING
  Then I press "runButton"
  And ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  Then I simulate a mousedown on the svg
  And ensure Flappy gameState is ACTIVE

  And I select the "How it works" small footer item
  And I get redirected to "/edit" via "dashboard"
  And I wait to see "#codeWorkspace"
  And ensure Flappy gameState is WAITING
  When I press "runButton"
  Then ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  When I simulate a mousedown on the svg
  Then ensure Flappy gameState is ACTIVE

  Then block "14" is child of block "13"
  And block "15" is child of block "14"
