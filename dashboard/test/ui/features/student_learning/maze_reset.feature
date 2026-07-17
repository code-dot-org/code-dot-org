Feature: Reset clears client-side video, callout, and level-progress state

Scenario: Resetting causes previously seen videos and callouts to reappear
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/reset"
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I wait to see ".video-modal"
  Then I close the dialog
  And I wait for the lab page to fully load
  Then callout "0" is visible
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/4"
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I am on "http://studio.code.org/courses/ui-test-maze/units/1/reset"
  Given I am on "http://studio.code.org/courses/ui-test-maze/units/1/lessons/1/levels/3"
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  And I wait for the lab page to fully load
  Then callout "0" is visible
