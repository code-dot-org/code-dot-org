@no_mobile
Feature: Feedback Tab Visibility

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

# This scenario will be removed when stable flag is deprecated.
Scenario: With stable flag, 'Feedback' tab is not visible for students and displays coming soon text to teachers
  #As student, stable flag, see nothing
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=commentBoxTab"
  And element ".uitest-feedback" is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=commentBoxTab"
  And I am on "http://studio.code.org/users/sign_out"

  #As teacher, stable tag, see temporary text
  Then I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=commentBoxTab"
  And I click selector ".uitest-feedback" once I see it
  And I wait until ".editor-column" contains text "Coming soon"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=commentBoxTab"

  #As teacher, all flags off, tab not visible
  And element ".uitest-feedback" is not visible

Scenario: With dev flag, as student, 'Feedback' tab is visible and displays temporary text
  #As student, see temporary text
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=devCommentBoxTab"
  And I click selector ".uitest-feedback" once I see it
  And I wait until ".editor-column" contains text "Feedback from Temp"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=devCommentBoxTab"

Scenario: With dev flag, as teacher,tab is invisible when not reviewing student work and visible when viewing student work
  #As teacher, not reviewing work, don't see feedback tab
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?enableExperiments=devCommentBoxTab"
  And element ".uitest-feedback" is not visible

  #As teacher, reviewing work, don't see temporary text
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I wait until element "textarea" is visible
  And I wait until ".editor-column" does not contain text "Coming soon"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?disableExperiments=devCommentBoxTab"
