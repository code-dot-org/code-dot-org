@dashboard_db_access
@no_mobile
Feature: Feedback Tab Visibility

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#finishButton"
  And I press "finishButton"

Scenario: As student 'Feedback' tab is not visible if no feedback
  #As student, with no feedback, can see Key Concept tab on rubric level
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
  And I wait to see ".uitest-feedback"
  And element ".editor-column" contains text "Key Concept"
  Then I click selector ".uitest-feedback"
  And I wait to see ".editor-column"
  And element ".editor-column" contains text "This is the key concept for this mini rubric."
  And element "#rubric-input-performanceLevel1" does not exist
  And element "#ui-test-submit-feedback" does not exist
  And element "#ui-test-feedback-time" does not exist
  And element "ui-test-feedback-input" does not exist
  Then I sign out

@no_ie
# Disabling IE due to bug where text changes in the feedback text input are not registered
# so submit button remains disabled
Scenario: As teacher, when viewing a level with student work,
feedback can be submitted and displayed. If there is a mini rubric, teacher can give feedback on rubric.
If a teacher on a level with mini rubric can see the rubric without viewing student work.
Otherwise don't show feedback tab
  Then I sign in as "Teacher_Lillian"
  And I give user "Teacher_Lillian" authorized teacher permission

  #Not automatically visible on contained levels with no mini rubric
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15"
  And I wait for the page to fully load
  And element ".uitest-feedback" is not visible

  #Not automatically visible on un-contained levels with no mini rubric
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And I wait for the page to fully load
  And element ".uitest-feedback" is not visible

  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
  And I wait for the page to fully load
  And I wait to see ".uitest-feedback"
  And element ".editor-column" contains text "Key Concept"
  Then I click selector ".uitest-feedback"
  And I wait to see ".editor-column"
  And element ".editor-column" contains text "This is the key concept for this mini rubric."
  And element "#rubric-input-performanceLevel1" does not exist
  And element "#ui-test-submit-feedback" does not exist
  And element "#ui-test-feedback-time" does not exist
  And element "ui-test-feedback-input" does not exist

  #As teacher, reviewing work, submit feedback
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait to see ".editor-column"
  And I wait to see "#ui-test-submit-feedback"
  And element ".editor-column" contains text "This is the key concept for this mini rubric."
  And element "#ui-test-submit-feedback" contains text "Save and share"
  And element "#ui-test-feedback-time" does not exist
  And I wait to see "#rubric-input-performanceLevel1"
  And I press "#rubric-input-performanceLevel1" using jQuery
  And I wait to see "#ui-test-feedback-input"
  And I press the first "#ui-test-feedback-input" element
  And I press keys "Nice!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery
  And element ".editor-column" contains text "Nice!"
  And element "#rubric-input-performanceLevel1" is checked
  And I wait until "#ui-test-feedback-time" contains text "Last updated"
  And element "#ui-test-submit-feedback" contains text "Update"

  #As teacher, refresh page and latest feedback is visible
  And I reload the page
  And I wait for the page to fully load
  And I wait until ".editor-column" contains text "Nice!"
  And I wait to see "#rubric-input-performanceLevel1"
  And element "#rubric-input-performanceLevel1" is checked
  And element ".editor-column" contains text matching "Last updated .* ago"
  And element "#ui-test-submit-feedback" contains text "Update"

  #As student, latest feedback from teacher is displayed
  Then I sign out
  And I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
  And I wait to see ".uitest-feedback"
  And I press the first ".uitest-feedback" element
  And I wait until ".editor-column" contains text "Nice!"
  And element "#rubric-input-performanceLevel1" is checked
  And element ".editor-column" contains text matching "Last updated .* ago"
