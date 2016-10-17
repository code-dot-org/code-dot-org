@eyes
@dashboard_db_access
@no_circle
Feature: Hidden Stages

Scenario: Hidden Stages
  When I open my eyes to test "hidden stages"
  Given I create a teacher-associated student named "bobby"
  And I sign out
  Then I sign in as "Teacher_bobby"
  Then I am on "http://studio.code.org/s/allthethings?enableExperiments=hiddenStages"
  And I select the first section
  Then I click selector "button:contains('Hidden'):nth(1)"
  And I see no difference for "teacher overview with hidden stage"
  And I sign out
  Then I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings?enableExperiments=hiddenStages"
  And I see no difference for "student overview with hidden stage"
  Then I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/2?enableExperiments=hiddenStages"
  And I see no difference for "student lesson on hidden stage"
  Then I am on "http://studio.code.org/s/allthethings?disableExperiments=hiddenStages"
  And I close my eyes
