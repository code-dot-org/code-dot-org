Feature: Viewing and dismissing the login callout

Scenario: Should see callout on 20-hour farmer lesson
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible

@as_student
Scenario: Should not see callout on farmer lesson if logged in
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is not visible

@as_student
Scenario: Should not see callout on CSF courseD lesson if logged in
  Given I am on "http://studio.code.org/s/coursed-2020/stage/2/puzzle/2"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is not visible

Scenario: Clicking anywhere should dismiss the login reminder
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible
  And I dismiss the login reminder
  And element ".instructions-markdown p" has text "Hi, I'm a farmer. I need your help to flatten the field on my farm so it's ready for planting. Move me to the pile of dirt and use the \"remove\" block to remove it."
  Then element "#runButton" is visible

Scenario: See age callout, not signin callout on hour of code
  Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I select age 10 in the age dialog

Scenario: After I dismiss the callout, it should not reappear upon refresh
  Given I am on "http://studio.code.org/s/20-hour/stage/9/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible
  And I dismiss the login reminder
  Then I reload the page
  Then element ".modal-backdrop" is not visible

Scenario: Nested callouts should work as expected
  Given I am on "http://studio.code.org/s/coursec-2020/stage/4/puzzle/2"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".modal-backdrop" is visible
  And I dismiss the login reminder
  And I wait until element ".csf-top-instructions p" is visible
