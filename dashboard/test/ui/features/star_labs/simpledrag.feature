Feature: Blocks can be dragged

Scenario: Connect two blocks from toolbox
  Given I am on "http://studio.code.org/s/20-hour/lessons/2/levels/5?noautoplay=true"
  When I wait for the lab page to fully load
  And I dismiss the login reminder
  And I wait to see ".blocklySvg"
  And I drag block "turnLeft" to offset "160, 100"
  And I drag block "turnRight" to offset "160, 75"
  And I wait for 1 seconds
  Then block "turnRight" is child of block "turnLeft"
