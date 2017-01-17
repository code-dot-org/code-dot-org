@eyes
@dashboard_db_access
@no_circle
Feature: Teacher Student Toggle

Scenario: Toggle on Multi Level
  When I open my eyes to test "toggle on multi level"
  Given I create an authorized teacher-associated student named "Daenerys"
  And I sign out
  Then I sign in as "Teacher_Daenerys"
  Then I am on "http://studio.code.org/s/allthethings/stage/9/puzzle/1"
  And I see no difference for "page load"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".uitest-viewAsStudent"
  And I see no difference for "view as student"
  Then I click selector ".uitest-viewAsTeacher"
  And I see no difference for "view as teacher"
  And I close my eyes

Scenario: Toggle on Hidden Maze Level
  When I open my eyes to test "toggle on hidden maze level"
  Given I create an authorized teacher-associated student named "Arya"
  And I sign out
  Then I sign in as "Teacher_Arya"
  Then I am on "http://studio.code.org/s/allthethings"
  And I select the first section
  And I wait to see ".uitest-hidden"
  Then I click selector ".uitest-hidden:nth(1)"
  Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true"
  And I close the instructions overlay if it exists
  And I see no difference for "page load"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".uitest-viewAsStudent"
  And I see no difference for "view as student"
  Then I click selector ".uitest-viewAsTeacher"
  And I see no difference for "view as teacher"
  And I close my eyes

Scenario: Toggle on Lockable Level
  When I open my eyes to test "toggle on a lockable level"
  Given I create an authorized teacher-associated student named "Joffrey"
  And I sign out
  Then I sign in as "Teacher_Joffrey"

  Then I am on "http://studio.code.org/s/allthethings/lockable/1/puzzle/1/page/1?noautoplay=true"
  And I see no difference for "page load"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".uitest-viewAsStudent"
  And I see no difference for "view as student while locked"
  Then I click selector ".uitest-viewAsTeacher"
  And I see no difference for "view as teacher while locked"

  Then I am on "http://studio.code.org/s/allthethings"
  And I select the first section
  Then I open the stage lock dialog
  Then I unlock the stage for students

  Then I am on "http://studio.code.org/s/allthethings/lockable/1/puzzle/1/page/1?noautoplay=true"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".uitest-viewAsStudent"
  And I see no difference for "view as student while unlocked"

  And I close my eyes
