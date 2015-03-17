@no_mobile
Feature: Puzzle share page

Background:
  Given I am on "http://learn.code.org/flappy/10?noautoplay=true"
  And I've initialized the workspace with my flappy puzzle.

Scenario: Share a flappy game, visit the share page, and visit the workspace
  When I press "x-close"
  Then I press "runButton"
  Then I press "rightButton"
  And I wait for 1 seconds
  Then I navigate to the share URL

  Then ensure Flappy gameState is WAITING
  Then I press "runButton"
  And ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  Then I simulate a mousedown on the svg
  And ensure Flappy gameState is ACTIVE

  When I press "open-workspace"
  And I wait for 5 seconds
  And ensure Flappy gameState is WAITING
  When I press "runButton"
  Then ensure Flappy gameState is WAITING
  And I wait for 1 seconds
  And ensure Flappy tickCount is positive
  When I simulate a mousedown on the svg
  Then ensure Flappy gameState is ACTIVE

  Then block "14" is child of block "13"
  And block "15" is child of block "14"
