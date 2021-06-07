@eyes
@as_authorized_taught_student
Feature: Submittable level

Scenario: Submittable level
  When I open my eyes to test "submittable level"
  Then I am on "http://studio.code.org/s/allthethings/lessons/9/levels/3?noautoplay=true"
  And I wait to see ".submitButton"
  And I see no difference for "initial load"
  And I click selector ".answerbutton[index=0]"
  And I click selector ".submitButton"

  Then I am on "http://studio.code.org/s/allthethings/lessons/9/levels/3?noautoplay=true"
  And I wait until element ".unsubmitButton" is visible
  And I see no difference for "submitted puzzle"
  And I close my eyes

Scenario: Lockable level
  When I open my eyes to test "lockable level"
  Then I am on "http://studio.code.org/s/allthethings"
  And I see no difference for "course overview"
  And I scroll our lockable lesson into view
  And I see no difference for "course overview with locked level in view"

  Then I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait to see ".submitButton"
  And I see no difference for "locked level on level page"
  Then I click selector ".header_popup_link"
  And I wait to see ".react_stage"
  And I scroll our lockable lesson into view
  Then I see no difference for "locked level popup progress"
  And I close my eyes
