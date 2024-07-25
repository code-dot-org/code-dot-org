@no_mobile
Feature: Using the V2 teacher dashboard

Scenario: Teacher can open and close Icon Key and details
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
  And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1?blocklyVersion=google"

  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"
  
  # toggle to V2 progress view
  And I wait until element "h6:contains(Icon Key)" is visible
  And I wait until element "#ui-test-progress-table-v2" is visible
  And element "#ui-test-progress-table-v2" is visible 

  # Teacher can minimize icon key
  And I wait until element "strong:contains(Assignment Completion States)" is visible
  Then I click selector "h6:contains('Icon Key')"
  And element "strong:contains(Assignment Completion States)" is hidden
  Then I click selector "h6:contains('Icon Key')"
  And I wait until element "strong:contains(Assignment Completion States)" is visible

  # Teacher can open the more details of the icon key and close it
  Then I click selector "a:contains('More Details')"
  And I wait until element "h3:contains(Progress Tracking Icon Key)" is visible
  And I click selector "#ui-close-dialog"
  And element "h3:contains(Progress Tracking Icon Key)" is hidden

Scenario: Viewing student metadata
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/9?noautoplay=true"
  And I wait to see "#runButton"
  When I press "runButton"
  And I wait for 5 seconds
  And I submit this level

  # Progress tab
  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"

  # Toggle to V2 progress view
  And I wait until element "h6:contains(Icon Key)" is visible
  And I wait until element "#ui-test-progress-table-v2" is visible

  # Can see and open menu with more options
  And I wait until element "#ui-see-more-options-dropdown" is visible
  Then I click selector "#ui-see-more-options-dropdown"
  And I wait until element "div:contains(Expand all student rows)" is visible
  And I wait until element "div:contains(Collapse all student rows)" is visible

  # Can click on more options and it responds appropriately
  Then I click selector "#ui-test-expand-all"
  And I wait until element "div:contains(Last Updated)" is visible
  And I wait until element "div:contains(Time Spent)" is visible
  And I wait until element "#ui-test-lesson-header-44" is visible
  And I scroll to "#ui-test-lesson-header-44"
  And I wait until ".ui-test-time-spent-44" contains one or more integers
  Then I click selector "#ui-see-more-options-dropdown"
  Then I click selector "#ui-test-collapse-all"
  And element "div:contains(Time Spent)" does not exist
  And element "div:contains(Last Updated)" does not exist

  # Can click on individual row and it opens with lesson and level data
  Then I click selector "#ui-test-student-row-unexpanded-Sally"
  And I wait until element "div:contains(Last Updated)" is visible
  And I wait until element "div:contains(Time Spent)" is visible

  # Can click on individual row and it closes with lesson and level data
  Then I click selector "#ui-test-student-row-expanded-Sally"
  And element "div:contains(Time Spent)" does not exist
  And element "div:contains(Last Updated)" does not exist

Scenario: Teacher can open and close lessons and see level data cells
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
    
  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"

  # Teacher can open lesson to view level data
  And I wait until element "#ui-test-lesson-header-2" is visible
  And I click selector "#ui-test-lesson-header-2"
  And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible

  # Teacher can close lesson so level data is no longer visible
  And I click selector "#ui-test-expanded-progress-column-header-2"
  And element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is not visible

Scenario: Teacher can navigate to student work by clicking level cell.
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
    
  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"

  # Teacher opens lesson data and clicks on level data cell
  And I wait until element "#ui-test-lesson-header-2" is visible
  And I click selector "#ui-test-lesson-header-2"
  And I click selector "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" once I see it to load a new tab
  And check that the URL contains "&user_id="
  And check that the URL contains "allthethings/lessons/2/levels/1"

@skip
Scenario: Teacher can open lesson data, refresh the page, and lesson data will still be shown
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
    
  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"

  # Open a lesson to see level data
  And I wait until element "#ui-test-lesson-header-2" is visible
  And I click selector "#ui-test-lesson-header-2"
  And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible
  # Waiting to make sure the user object has been updated before reloading the page
  And I wait for 3 seconds

  # Verify the lesson is still open
  Then I reload the page
  And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible


@eyes
Scenario: Teacher can view lesson progress for when students have completed a lesson and when they have started a lesson but not finished
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
  # Student completes one of many levels in lesson 2
  And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1?blocklyVersion=google"

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
  And I navigate to the V2 progress dashboard for "Untitled Section"
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
  And I navigate to the V2 progress dashboard for "Untitled Section"

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
  And I wait for 3 seconds

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
  And I wait for 3 seconds

  # Teacher can see keep working icon
  Given I am on "http://studio.code.org/"
  When I click selector "a:contains(Untitled Section)" once I see it to load a new page
  And I wait until element "#ui-test-lesson-header-39" is visible
  And I scroll to "#ui-test-lesson-header-39"
  And I see no difference for "keep working icon is displayed"

  And I close my eyes

@eyes
Scenario: Teacher can view choice levels
  And I open my eyes to test "V2 Progress - Choice Levels"

  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"

  # Student submits choice level
  Given I am on "http://studio.code.org/s/allthethings/lessons/40/levels/1/sublevel/2?noautoplay=true"
  And I wait until I see selector "button:contains(Submit)"
  And I click selector "button:contains(Submit)"
  And I wait to see "#confirm-button"
  And I press "confirm-button"

  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  And I navigate to the V2 progress dashboard for "Untitled Section"

  # View unexpanded choice level
  And I wait until element "#ui-test-lesson-header-1" is visible
  And I scroll to "#ui-test-lesson-header-40"
  And I click selector "#ui-test-lesson-header-40"
  Then I wait until I see selector "button:contains(40.1)"
  And I see no difference for "unexpanded choice level"

  # View expanded choice level
  And I click selector "button:contains(40.1)"
  Then I wait until I see selector "button:contains(b)"
  And I see no difference for "expanded choice level"

  # View expanded choice level
  And I click selector "button:contains(b)"
  And I see no difference for "unexpanded choice level - closed"

  And I close my eyes
