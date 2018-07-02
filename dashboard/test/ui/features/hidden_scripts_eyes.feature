@eyes
@dashboard_db_access
Feature: Hidden Scripts

Scenario: Hidden Scripts
  When I open my eyes to test "hidden scripts"
  Given I create an authorized teacher-associated student named "bobby"
  And I sign out
  Then I sign in as "Teacher_bobby"
  Then I am on "http://studio.code.org/courses/allthethingscourse"
  And I wait to see ".uitest-togglehidden"
  Then I click selector ".uitest-togglehidden:nth(0) div:contains('Hidden')"
  And I see no difference for "teacher overview with hidden script"
  And I sign out
  Then I sign in as "bobby"
  And I am on "http://studio.code.org/courses/allthethingscourse"
  And I see no difference for "student course overview with hidden script"
  Then I am on "http://studio.code.org/s/allthethings"
  And I see no difference for "student script overview on hidden script"
  Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
  And I see no difference for "student lesson on hidden script"
  And I close my eyes
