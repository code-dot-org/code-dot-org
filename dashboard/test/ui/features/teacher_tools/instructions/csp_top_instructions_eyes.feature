@eyes
@as_teacher
Feature: Eyes Tests for Top Instructions CSP

Scenario: CSD and CSP Top Instructions
  When I open my eyes to test "top instructions in CSP"
  And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/1"
  And I wait for the page to fully load
  Then I see no difference for "teacher in applab level with rubric"
  Then I click selector ".uitest-feedback"
  Then I see no difference for "teacher in applab level viewing rubric"
  Then I click selector ".uitest-instructionsTab"
  Then I see no difference for "teacher in applab level with rubric after viewing rubric"

  And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/2"
  And I wait until element ".user_menu" is visible
  And I wait until element "iframe" is visible
  And I switch to the first iframe
  And I wait to see "#bramble"
  And I wait until element "iframe" is visible
  And I switch to the first iframe
  And I wait to see "#editor-holder"
  And I switch to the default content
  Then I see no difference for "teacher in weblab level with rubric"
  Then I click selector ".uitest-feedback"
  Then I see no difference for "teacher in weblab level viewing rubric"
  Then I click selector ".uitest-instructionsTab"
  Then I see no difference for "teacher in weblab level with rubric after viewing rubric"

  And I close my eyes

Scenario: Resizing CSD and CSP Top Instructions
  When I open my eyes to test "resizing top instructions in CSP"
  Given I create an authorized teacher-associated student named "Sally"
  When I sign in as "Teacher_Sally" and go home
  And I wait until element ".uitest-owned-sections" is visible
  Then I save the section id from row 0 of the section table

  And I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1"
  And I wait for the page to fully load
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load

  Then I see no difference for "teacher in feedback tab"
  Then I click selector ".uitest-instructionsTab"
  And I wait until element ".editor-column" contains text "Do This"
  And I drag element "#ui-test-resizer" 0 horizontally and 100 vertically
  Then I see no difference for "teacher drag instructions tab"
  Then I click selector ".uitest-feedback"
  And I wait until element ".editor-column" contains text "Teacher Feedback"
  Then I see no difference for "teacher back in feedback tab"

  And I close my eyes
