Feature: Blocks can be dragged

Scenario: Connect two blocks from toolbox
  Given I am on "http://studio.code.org/s/20-hour/lessons/2/levels/5?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And I wait to see ".blocklySvg"
  And I drag block "1" to offset "160, 100"
  And I drag block "1" to offset "160, 130"
  And I wait for 1 seconds
  Then block "6" is child of block "5"
