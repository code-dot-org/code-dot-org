@dashboard_db_access
@eyes
Feature: Feedback Tab Visibility

  Background:
    Given I create a teacher-associated student named "Lillian"
    And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1?noautoplay=true"
    Then I rotate to landscape
    And I wait to see "#runButton"
    And I press "runButton"
    And I wait to see "#finishButton"
    And I press "finishButton"

  Scenario: As student 'Feedback' tab is the 'Key Concept' tab if no feedback
    When I open my eyes to test "student with no feedback"
    And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1"
    And I wait for the page to fully load
    Then I see no difference for "student with no feedback tab"
    Then I sign out
    And I close my eyes

# Disabling IE due to bug where text changes in the feedback text input are not registered
# so submit button remains disabled
  Scenario: As teacher, when viewing a level with student work,
  feedback can be submitted and displayed. If there is a mini rubric, teacher can give feedback on rubric.
  If a teacher on a level with mini rubric can see the rubric without viewing student work.
  Otherwise don't show feedback tab
    When I open my eyes to test "teacher giving student feedback"
    And I sign in as "Teacher_Lillian"
    And I give user "Teacher_Lillian" authorized teacher permission

    And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1"
    And I wait for the page to fully load
    Then I see no difference for "teacher rubric feedback tab"

  #As teacher, reviewing work, submit feedback
    And I wait to see ".show-handle"
    Then I click selector ".show-handle .fa-chevron-left"
    And I wait until element ".student-table" is visible
    And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
    And I wait for the page to fully load
    Then I see no difference for "teacher giving feedback tab load"

    And I wait to see "#rubric-input-performanceLevel1"
    And I press "#rubric-input-performanceLevel1" using jQuery
    And I wait to see "#ui-test-feedback-input"
    And I press the first "#ui-test-feedback-input" element
    And I press keys "Nice!" for element "#ui-test-feedback-input"
    And I press "#ui-test-submit-feedback" using jQuery
    And element ".editor-column" contains text "Nice!"
    And element "#rubric-input-performanceLevel1" is checked
    And I wait until "#ui-test-feedback-time" contains text "Updated by you"
    And element "#ui-test-submit-feedback" contains text "Update"

  #As teacher, refresh page and latest feedback is visible
    And I reload the page
    And I wait for the page to fully load
    Then I see no difference for "teacher gave feedback"

  #As student, latest feedback from teacher is displayed
    Then I sign out
    And I sign in as "Lillian"
    And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1"
    And I wait to see ".uitest-feedback"
    Then I press the first ".uitest-feedback" element
    And I wait to see "#ui-test-feedback-time"
    Then I see no difference for "student viewing teacher feedback"

    And I close my eyes
