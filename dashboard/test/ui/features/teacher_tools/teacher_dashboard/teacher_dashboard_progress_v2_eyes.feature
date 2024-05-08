@no_mobile
Feature: Using the V2 teacher dashboard - eyes
  @eyes
  Scenario: Teacher can view lesson progress for when students have completed a lesson and when they have started a lesson but not finished
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
    # Student completes one of many levels in lesson 2
  And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    # Student completes all the levels in lesson 10 (there is only one level)
  Given I am on "http://studio.code.org/s/allthethings/lessons/10/levels/1?noautoplay=true"
  Then I wait for 3 seconds
  And I wait until element ".submitButton" is visible
  And I press ".answerbutton[index=1]" using jQuery
  And I press ".answerbutton[index=0]" using jQuery
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"

  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard
  And I wait until element "#uitest-circle" is visible

  And I open my eyes to test "V2 progress dashboard"
  And I see no difference for "V2 progress dashboard"
  And I close my eyes

  @eyes
  Scenario: Teacher can view student work, ask student to keep working, on rubric level
  And I open my eyes to test "V2 Progress Dashboard Assessments"
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"

    # Student submits project
  Given I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1?noautoplay=true"
  Then I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#finishButton"
  And I press "finishButton"

    # Teacher sees "needs feedback" in the table
  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard

    # Check that the needs feedback icon is present
  And I wait until element "#ui-test-lesson-header-1" is visible
  And I scroll to "#ui-test-lesson-header-38"
  And I click selector "#ui-test-lesson-header-38"
  And I see no difference for "needs feedback icon is displayed"

    # Teacher gives feedbackAnd I wait to see "#rubric-input-performanceLevel1"
  And I click selector "#ui-test-s-allthethings-lessons-38-levels-1-cell-data" once I see it to load a new tab
  And I wait to see "#ui-test-feedback-input"
  And I press the first "#ui-test-feedback-input" element
  And I press keys "Nice!" for element "#ui-test-feedback-input"
  And I press "#ui-test-submit-feedback" using jQuery
  And element ".editor-column" contains text "Nice!"

    # Teacher can see feedback given icon
  Given I am on "http://studio.code.org/"
  When I click selector "a:contains(Untitled Section)" once I see it to load a new page
  And I wait until element "#ui-test-lesson-header-39" is visible
  And I scroll to "#ui-test-lesson-header-39"
  And I see no difference for "feedback given icon is displayed"

    # Teacher can indicate student needs to keep working
  And I click selector "#ui-test-s-allthethings-lessons-38-levels-1-cell-data" once I see it to load a new tab
  And I wait to see "#ui-test-feedback-input"
  And I click selector "#keep-working" once I see it
  And I press "#ui-test-submit-feedback" using jQuery

    # Teacher can see keep working icon
  Given I am on "http://studio.code.org/"
  When I click selector "a:contains(Untitled Section)" once I see it to load a new page
  And I wait until element "#ui-test-lesson-header-39" is visible
  And I scroll to "#ui-test-lesson-header-39"
  And I see no difference for "keep working icon is displayed"

  And I close my eyes
