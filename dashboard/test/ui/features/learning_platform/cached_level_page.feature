@no_mobile
Feature: Cached level page

  Scenario: View cached level page as teacher
    # Set up a section with one student
    Given I create a teacher named "Teacher Monica"
    And I give user "Teacher Monica" authorized teacher permission
    When I create a new student section and go home
    And I save the section id from row 0 of the section table
    Given I create a student named "Joey"
    And I join the section

    # Teacher panel loads as expected on cached level page
    Given I sign in as "Teacher Monica"
    Then I navigate to the script "dance" lesson 1 level 13 for the section I saved
    And I wait until element "#teacher-panel-container" is visible
    And I wait until element "td:eq(1)" contains text "Joey"
    And I wait for 20 seconds
