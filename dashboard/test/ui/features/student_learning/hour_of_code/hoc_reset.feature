Feature: HOC reset resets client state

Scenario: reset resets videos, callouts, level progress
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/reset"
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4"
  Then I wait to see ".video-modal"
  Then I close the dialog
  Then callout "1" is visible
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/5"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4"
  Then I am on "http://studio.code.org/courses/ui-test-csf/units/1/reset"
  Given I am on "http://studio.code.org/courses/ui-test-csf/units/1/lessons/1/levels/4"
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then callout "1" is visible
