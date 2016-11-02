Feature: Blocks can be dragged from popouts

Background:
  Given I am on "http://studio.code.org/s/20-hour/stage/11/puzzle/1?noautoplay=true"
  Then I wait until element "#runButton" is visible
  And I click selector ".csf-top-instructions button:contains(OK)"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I press ":1.label"
  And I drag block "2" to block "1"
  And I press ":2.label"
  And I drag block "8" to block "6"
  And I wait for 1 seconds
  Then block "12" is child of block "6"
