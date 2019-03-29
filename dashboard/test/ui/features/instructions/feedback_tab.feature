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

Scenario: As student with dev experiment on, 'Feedback' tab is not visible if no feedback
  #As student, see temporary text
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1?enableExperiments=2019-mini-rubric"
  And element ".uitest-feedback" is not visible
  Then I sign out

@no_ie
# Disabling IE due to bug where text changes in the feedback text input are not registered
# so submit button remains disabled
Scenario: As teacher, when viewing a level with student work,
feedback can be submitted and displayed. If in experiment and there is a mini rubric, teacher can give feedback on rubric.
If a teacher in experiment on a level with mini rubric can see the rubric without viewing student work.
Otherwise don't show feedback tab
  Then I sign in as "Teacher_Lillian"

  #Not automatically visible on contained levels with no mini rubric
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15?enableExperiments=2019-mini-rubric"
  And I wait for the page to fully load
  And element ".uitest-feedback" is not visible

  #Not automatically visible on un-contained levels with no mini rubric
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And I wait for the page to fully load
  And element ".uitest-feedback" is not visible

  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
  And I wait for the page to fully load
  And I wait to see ".uitest-feedback"

  #As teacher, reviewing work, submit feedback
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I wait to see ".editor-column"
  And I wait to see "#ui-test-submit-feedback"
  And element ".editor-column" contains text "This is the key concept for this mini rubric."
  And element "#ui-test-submit-feedback" contains text "Save and share"
  And element "#ui-test-feedback-time" does not exist
  And I wait to see "#rubric-input-exceeds"
  And I press "#rubric-input-exceeds" using jQuery
  And I wait to see "#ui-test-feedback-input"
  And I press the first "#ui-test-feedback-input" element
  And I press keys "Nice!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery
  And element ".editor-column" contains text "Nice!"
  And element "#rubric-input-exceeds" is checked
  And I wait until "#ui-test-feedback-time" contains text "Last updated"
  And element "#ui-test-submit-feedback" contains text "Update"

  #As teacher, refresh page and latest feedback is visible
  And I reload the page
  And I wait for the page to fully load
  And I wait until ".editor-column" contains text "Nice!"
  And I wait to see "#rubric-input-exceeds"
  And element "#rubric-input-exceeds" is checked
  And element ".editor-column" contains text matching "Last updated .* ago"
  And element "#ui-test-submit-feedback" contains text "Update"

  #Tab not visible unless viewing student work
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1?disableExperiments=2019-mini-rubric"
  And I wait for the page to fully load
  And element ".uitest-feedback" is not visible

  #As teacher, reviewing work, feedback tab is visible
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I wait to see ".uitest-feedback"
  And I wait until ".editor-column" contains text "Nice!"
  And element "#rubric-input-exceeds" is not visible
  And I wait to see "#ui-test-submit-feedback"
  And element "#ui-test-submit-feedback" contains text "Update"
  And element ".editor-column" contains text matching "Last updated .* ago"

  #As student, latest feedback from teacher is displayed
  Then I sign out
  And I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1?enableExperiments=2019-mini-rubric"
  And I press the first ".uitest-feedback" element
  And I wait until ".editor-column" contains text "Nice!"
  And element "#rubric-input-exceeds" is checked
  And element ".editor-column" contains text matching "Last updated .* ago"
