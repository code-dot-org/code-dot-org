@dashboard_db_access
# TODO: (madelynkasula) 03/28/2019 De-flake and re-enable this test.
@skip
Feature: Lesson extras teacher panel

  Scenario: View student lesson extras progress
    Given I create an authorized teacher-associated student named "Sally"
    And I sign out
    When I sign in as "Teacher_Sally"
    And I wait until element ".uitest-owned-sections" is visible
    Then I save the section id from row 0 of the section table

    # Lesson extras overview page
    Then I navigate to the script "coursea-2018" stage 14 lesson extras page for the section I saved
    And I wait until element ".teacher-panel" is visible
    And check that the URL contains "section_id="
    And I wait until element "h4:contains(Untitled Section)" is visible
    And I wait until element "td.name:contains(Sally)" is visible
    And I click selector "td.name:contains(Sally) > a" once I see it

    # Lesson extras individual puzzle page
    And I click selector "button:contains(Try it):eq(0)" once I see it
    And I wait until element ".teacher-panel" is visible
    And check that the URL contains "section_id="
    And check that the URL contains "user_id="
    And I wait until element "h4:contains(Untitled Section)" is visible
    And I wait until element ".students h4:contains(Student)" is visible
    And I wait until element ".students a:contains(Sally)" is visible
