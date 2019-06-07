@eyes
@as_teacher
Feature: Eyes Tests for Top Instructions CSP

Scenario: CSD and CSP Top Instructions
  When I open my eyes to test "top instructions in CSP"
  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/1"
  And I wait for the page to fully load
  Then I see no difference for "teacher in applab level with rubric"
  Then I click selector ".uitest-feedback"
  Then I see no difference for "teacher in applab level viewing rubric"
  Then I click selector ".uitest-instructionsTab"
  Then I see no difference for "teacher in applab level with rubric after viewing rubric"

  And I am on "http://studio.code.org/s/allthethings/stage/38/puzzle/2"
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
