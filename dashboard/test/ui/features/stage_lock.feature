@dashboard_db_access
Feature: Stage Locking

Background:
  Given I create an authorized teacher-associated student named "bobby"

@eyes
Scenario: Stage Locking Dialog
  When I open my eyes to test "stage locking"
  And I sign out
  Then I sign in as "Teacher_bobby"
  Then I am on "http://studio.code.org/s/allthethings"
  And I select the first section
  And I see no difference for "selected section"
  Then I open the stage lock dialog
  And I see no difference for "stage lock dialog"
  Then I unlock the stage for students
  And I wait until element ".modal-backdrop" is gone
  And I scroll our lockable stage into view
  And I see no difference for "course overview for authorized teacher"
  And I close my eyes

Scenario: Lock settings for students
  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  When I am on "http://studio.code.org/s/allthethings/lockable/1/puzzle/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-stage:contains(stage is currently locked)" is visible

  # teacher unlocks

  When I sign out
  And I sign in as "Teacher_bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I select the first section
  And I open the stage lock dialog
  And I unlock the stage for students
  And I wait until element ".modal-backdrop" is gone
  And I sign out

  # now unlocked/not tried for student

  When I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for stage 31 level 1 is "not_tried"
  Then I verify progress for stage 31 level 2 is "not_tried"
  Then I verify progress for stage 31 level 3 is "not_tried"
  Then I verify progress for stage 31 level 4 is "not_tried"

  # student submits

  When I am on "http://studio.code.org/s/allthethings/lockable/1/puzzle/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I click selector "#ok-button"
  And I wait until current URL contains "/s/allthethings/stage/31/puzzle/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  # teacher marks readonly

  When I sign out
  And I sign in as "Teacher_bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I select the first section
  And I open the stage lock dialog
  And I show stage answers for students
  And I wait until element ".modal-backdrop" is gone
  And I sign out

  # now unlocked/submitted for student

  When I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for stage 31 level 1 is "perfect_assessment"
  Then I verify progress for stage 31 level 2 is "perfect_assessment"
  Then I verify progress for stage 31 level 3 is "perfect_assessment"
  Then I verify progress for stage 31 level 4 is "perfect_assessment"

  When I am on "http://studio.code.org/s/allthethings/lockable/1/puzzle/1/page/4"
  And I wait until element "h2:contains(Pre-survey)" is visible
  Then element "h3:contains(Answer)" is visible
  Then element ".previousPageButton" is visible
  # in the future we will want the unsubmit button to be hidden instead.
  Then element ".unsubmitButton" is visible

