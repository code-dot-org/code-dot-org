Feature: Reset clears client-side video, callout, and level-progress state

# Uses level 3 (blockly:Maze:2_5), which carries both an autoplay video and a
# "watch again" callout. The callout is checked here rather than on level 1
# because a course reset redirects to level 1 and autoplays its video, which
# consumes level 1's callout before it can be asserted (the legacy /hoc route
# deferred callouts past the video; the migrated course route does not).

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
