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

  @no_ie
# Disabling IE due to bug where text changes in the feedback text input are not registered

# so submit button remains disabled
  Scenario: As teacher with dev experiment on, when viewing a level with a mini rubric and student work,
  feedback can be submitted and displayed. Otherwise don't show feedback tab
    Then I sign in as "Teacher_Lillian"

  #Not automatically visible on contained levels with no mini rubric
    Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15?enableExperiments=2019-mini-rubric"
    And element ".uitest-feedback" is not visible

  #Not automatically visible on un-contained levels with no mini rubric
    Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
    And element ".uitest-feedback" is not visible

    And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
    And I wait to see ".uitest-feedback"

  #As teacher, reviewing work, submit feedback
    And I wait to see ".show-handle"
    Then I click selector ".show-handle .fa-chevron-left"
    Then I click selector ".section-student .name a"
    And I press the first "#ui-test-feedback-input" element
    And element ".editor-column" contains text "This is the key concept for this mini rubric."
    And element "#ui-test-submit-feedback" contains text "Save and share"
    And element "#ui-test-feedback-time" does not exist
    And I press the first "#exceeds-input" element
    And I press keys "Nice!" for element "#ui-test-feedback-input"
    And I press "#ui-test-submit-feedback" using jQuery
    And element ".editor-column" contains text "Nice!"
    And element "#exceeds-input" is checked
    And I wait until "#ui-test-feedback-time" contains text "Last updated"
    And element "#ui-test-submit-feedback" contains text "Update"

  #As teacher, refresh page and latest feedback is visible
    And I reload the page
    And I wait for the page to fully load
    And I wait until ".editor-column" contains text "Nice!"
    And element "#exceeds-input" is checked
    And element ".editor-column" contains text matching "Last updated .* ago"
    And element "#ui-test-submit-feedback" contains text "Update"

  #As student, latest feedback from teacher is displayed
    Then I sign out
    And I sign in as "Lillian"
    And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
    And I press the first ".uitest-feedback" element
    And I wait until ".editor-column" contains text "Nice!"
    And element "#exceeds-input" is checked
    And element ".editor-column" contains text matching "Last updated .* ago"
