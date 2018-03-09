@eyes
@dashboard_db_access
Feature: Stage Locking

Scenario: Stage Locking Dialog
  When I open my eyes to test "stage locking"
  Given I create an authorized teacher-associated student named "bobby"
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
