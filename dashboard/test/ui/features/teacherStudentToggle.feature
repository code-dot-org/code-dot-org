@eyes
@dashboard_db_access
@no_circle
Feature: Teacher Student Toggle

Scenario: Toggle on Multi Level
  When I open my eyes to test "toggle on multi level"
  Given I create an authorized teacher-associated student named "Trudy"
  And I sign out
  Then I sign in as "Teacher_Trudy"
  Then I am on "http://studio.code.org/s/allthethings/stage/9/puzzle/1?enableExperiments=viewAsToggle"
  And I see no difference for "page load"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector "#uitest-viewAsStudent"
  And I see no difference for "view as student"
  Then I click selector "#uitest-viewAsTeacher"
  And I see no difference for "view as teacher"
  Then I am on "http://studio.code.org/s/allthethings/stage/9/puzzle/1?disableExperiments=viewAsToggle"
  And I close my eyes

# Scenario: Toggle on Hidden Maze Level
#   When I open my eyes to test "toggle on hidden maze level"
#   Given I create an authorized teacher-associated student named "Reginald"
#   And I sign out
#   Then I sign in as "Teacher_Reginald"
#   Then I am on "http://studio.code.org/s/allthethings"
#   And I select the first section
#   And I wait to see ".uitest-hidden"
#   Then I click selector ".uitest-hidden:nth(1)"
#   And I wait for 20 seconds
#   Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1?noautoplay=true&enableExperiments=viewAsToggle"
#   And I see no difference for "page load"
#   Then I click selector ".show-handle .fa-chevron-left"
#   Then I click selector "#uitest-viewAsStudent"
#   And I see no difference for "view as student"
#   Then I click selector "#uitest-viewAsTeacher"
#   And I see no difference for "view as teacher"
#   Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1?disableExperiments=viewAsToggle"
#   And I press "x-close"
#   And I close my eyes
