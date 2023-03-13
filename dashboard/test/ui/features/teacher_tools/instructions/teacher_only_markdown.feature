@eyes
Feature: Teacher Only Markdown

Scenario: Applab level with teacher only markdown
  When I open my eyes to test "teacher only markdown"
  Given I create an authorized teacher-associated student named "Manuel"
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "student doesnt see teacher markdown"
  Then I sign out
  And I sign in as "Teacher_Manuel"
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "authorized teacher does see teacher markdown"
  Then I close my eyes
