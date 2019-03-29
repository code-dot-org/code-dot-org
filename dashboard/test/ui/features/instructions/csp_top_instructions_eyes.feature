@eyes
@as_teacher
Feature: Eyes Tests for Top Instructions CSP

Scenario: CSD and CSP Top Instructions
  When I open my eyes to test "top instructions in CSP"
  And I am on "https://studio.code.org/s/allthethings/stage/38/puzzle/1?enableExperiments=2019-mini-rubric"
  And I wait for the page to fully load
  Then I see no difference for "teacher in applab level with rubric"
  Then I click selector ".uitest-feedback"
  Then I see no difference for "teacher in applab level viewing rubric"
  Then I click selector ".uitest-instructionsTab"
  Then I see no difference for "teacher in applab level with rubric after viewing rubric"

  And I am on "https://studio.code.org/s/allthethings/stage/38/puzzle/2?enableExperiments=2019-mini-rubric"
  And I wait for the page to fully load
  Then I see no difference for "teacher in weblab level with rubric"
  Then I click selector ".uitest-feedback"
  Then I see no difference for "teacher in weblab level viewing rubric"
  Then I click selector ".uitest-instructionsTab"
  Then I see no difference for "teacher in weblab level with rubric after viewing rubric"

  And I close my eyes