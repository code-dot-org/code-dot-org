Feature: Viewing and dismissing the login callout

Scenario: Should see callout on 20-hour farmer lesson
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible

Scenario: Clicking anywhere should dismiss the login reminder
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible
  And I dismiss the login reminder
  And element ".instructions-markdown p" has text "Hi, I'm a farmer. I need your help to flatten the field on my farm so it's ready for planting. Move me to the pile of dirt and use the \"remove\" block to remove it."
  Then element "#runButton" is visible

Scenario: Should not see callout on hour of code
  Given I am on "http://studio.code.org/s/dance-2019/stage/1/puzzle/1"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is not visible
