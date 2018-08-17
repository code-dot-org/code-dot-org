@no_mobile
Feature: Feedback Tab Visibility

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"
  And I submit this level

Scenario: As student, 'Feedback' tab is not visible if no feedback
  #As student, see temporary text
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And element ".uitest-feedback" is not visible

@no_ie
# Disabling IE due to bug where text changes in the feedback text input are not registered,
# so submit button remains disabled
Scenario: As teacher, tab is invisible when not reviewing student work and visible when viewing student work, feedback can be submitted and displayed
  #As teacher, not reviewing work, don't see feedback tab
  Then I sign in as "Teacher_Lillian"

  #Not automatically visible on contained levels
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15"
  And element ".uitest-feedback" is not visible

  #Not automatically visible on un-contained levels
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And element ".uitest-feedback" is not visible

  #As teacher, reviewing work, submit feedback
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I press the first "#ui-test-feedback-input" element
  And element "#ui-test-submit-feedback" contains text "Save and share"
  And element "#ui-test-feedback-time" does not exist
  And I press keys "Nice!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery
  And element ".editor-column" contains text "Nice!"
  And I wait until "#ui-test-feedback-time" contains text "Last updated"
  And element "#ui-test-submit-feedback" contains text "Update"

  #As teacher, refresh page and latest feedback is visible
  And I reload the page
  And I wait for the page to fully load
  And I wait until ".editor-column" contains text "Nice!"
  And element ".editor-column" contains text matching "Last updated .* ago"
  And element "#ui-test-submit-feedback" contains text "Update"

  #As student, latest feedback from teacher is displayed
  Then I sign out
  And I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And I press the first ".uitest-feedback" element
  And I wait until ".editor-column" contains text "Nice!"
  And element ".editor-column" contains text matching "Feedback from Teacher_Lillian\(From .* ago\)"
