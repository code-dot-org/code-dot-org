Feature: Viewing Lesson Plans

@eyes
Scenario: Print Mode
  When I open my eyes to test "printed lesson plan"
  Given I am on "http://studio.code.org/s/allthemigratedthings/lessons/4?emulate_print_media"
  And I rotate to landscape
  And I wait until element ".lesson-overview" is visible
  And I see no difference for "initial page view"
  And I close my eyes
