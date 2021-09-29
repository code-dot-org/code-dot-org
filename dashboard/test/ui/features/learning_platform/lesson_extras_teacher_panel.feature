@no_mobile
Feature: Lesson extras teacher panel

  Scenario: View student lesson extras progress
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I wait until element ".uitest-owned-sections" is visible
    Then I save the section id from row 0 of the section table

    # Lesson extras overview page
    Then I navigate to the script "coursea-2018" lesson 14 lesson extras page for the section I saved
    And I wait until element "#teacher-panel-container" is visible
    And check that the URL contains "section_id="
    And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
    And I wait until element ".student-table" is visible
    And I click selector "#teacher-panel-container tr:nth(1)" to load a new page

    # Lesson extras individual puzzle page
    And I click selector ".sublevel-card-title-uitest" once I see it to load a new page
    When I wait for the page to fully load
    And I wait until element "#teacher-panel-container" is visible
    And check that the URL contains "section_id="
    And check that the URL contains "user_id="
    And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
    And I wait until element "td:eq(1)" contains text "Sally"