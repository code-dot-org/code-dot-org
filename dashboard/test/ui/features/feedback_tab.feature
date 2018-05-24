@no_mobile
Feature: Submittable AppLab

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"

  # Submit something.
  And I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

Scenario: As a student, 'Feedback' tab is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=commentBoxTab"
  And element ".uitest-feedback" is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=commentBoxTab"

Scenario: 'Feedback' tab is not visible if user is a student (dev flag)
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=devCommentBoxTab"
  And element ".uitest-feedback" is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=devCommentBoxTab"

Scenario: As teacher, with dev flag, default to feedback tab and see text area without temporary text
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=devCommentBoxTab"
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I wait until element "textarea" is visible
  And I wait until ".editor-column" does not contain text "Coming soon"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=devCommentBoxTab"

Scenario: As teacher, with dev flag, but not reviewing student work, do not show feedback tab
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=devCommentBoxTab"
  And element ".uitest-feedback" is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=devCommentBoxTab"

Scenario: As a teacher, with stable flag, see feedback tab and display text 'Coming soon'
  Then I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=commentBoxTab"
  And I click selector ".uitest-feedback" once I see it
  And I wait until ".editor-column" contains text "Coming soon"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=commentBoxTab"

Scenario: 'Feedback' tab is not visible if user is a teacher but all flags are off
  Then I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20"
  And element ".uitest-feedback" is not visible
