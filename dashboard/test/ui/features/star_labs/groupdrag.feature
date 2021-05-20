Feature: Blocks dragged in groups can have children attach to other blocks

Background:
  Given I am on "http://studio.code.org/s/20-hour/lessons/7/levels/6?noautoplay=true"
  And I wait for the page to fully load

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I drag block "1" to offset "300, 150"
  And I drag block "3" to offset "300, 80"
  And I wait for 1 seconds
  Then block "10" is child of block "9"
  And I drag block "4" to offset "300, 150"
  And I drag block "9" to offset "0, 50"
  Then block "11" is child of block "10"
