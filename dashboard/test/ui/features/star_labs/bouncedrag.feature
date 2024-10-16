Feature: Bounce blocks can be dragged

Background:
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/1?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I wait for the lab page to fully load
  And I drag block "moveLeft" to block "whenLeft"
  And I drag block "moveRight" to block "moveLeft"
  And I wait for 1 seconds
  Then block "moveRight" is child of block "moveLeft"
