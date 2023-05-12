@no_mobile
Feature: Using the teacher dashboard 4

  Scenario: Loading section projects
    Given I create a teacher-associated student named "Sally"
    And I am on "http://studio.code.org/projects/applab"

    # Make sure the initial save doesn't interfere with renaming the project
    And I wait for initial project save to complete

    # rename the project
    And I click selector ".project_edit" once I see it
    And I wait until element ".project_name.header_input" is visible
    And I type "thumb wars" into ".project_name.header_input"
    And I click selector ".project_save"

    And I wait until element ".project_edit" is visible
    Then element ".project_name.header_text" contains text "thumb wars"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Projects)" once I see it
    And I wait until element "#uitest-projects-table" is visible
    And I click selector "a:contains('thumb wars')" once I see it to load a new tab
    And I wait until element ".project_name.header_text" is visible
    And element ".project_name.header_text" contains text "thumb wars"

  Scenario: Toggling student progress
    Given I create an authorized teacher-associated student named "Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"

    # Progress tab
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I press the first ".uitest-summary-cell" element
    And I see ".uitest-detail-cell"

