@no_mobile
Feature: Feedback Tab Display for Multiple Teachers

Background:
  Given I create two teachers associated with a student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"
  And I submit this level

@no_ie
# Disabling IE due to bug where text changes in the feedback text input are not registered,
# so submit button remains disabled
Scenario: With dev flag, student sees feedback from multiple teachers, when available
  #As teacher, not reviewing work, don't see feedback tab
  Then I sign out and sign in as "First_Teacher"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"

  #As teacher1, reviewing work, submit feedback
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I press the first "#ui-test-feedback-input" element
  And I press keys "Nice!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery

  #As teacher2, reviewing work, submit feedback
  Then I sign out and sign in as "Second_Teacher"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I press the first "#ui-test-feedback-input" element
  And I press keys "Better!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery

  #As student, latest feedback from both teachers is displayed
  Then I sign out
  And I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
  And I wait to see ".uitest-feedback"
  And I press the first ".uitest-feedback" element
  And I wait until ".editor-column" contains text "Nice!"
  And element ".editor-column" contains text "Feedback from First_Teacher"
  And element ".editor-column" contains text "Better!"
  And element ".editor-column" contains text "Feedback from Second_Teacher"

