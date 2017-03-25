@no_ie
@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the teacher dashboard

  Scenario: Loading the teacher dashboard
    Given I am on "http://code.org/"
    And I am a teacher
    And I am on "http://code.org/teacher-dashboard"
    Then I wait to see ".outerblock"
    Then I click selector "div.title:contains('Student Accounts and Progress')"
    Then check that I am on "http://code.org/teacher-dashboard#/sections"

  Scenario: Loading student progress
    Given I create a teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I sign out
    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard"
    And I click selector "div.title:contains('Student Accounts and Progress')" once I see it
    And I click selector "a:contains('SectionName')" once I see it
    And I click selector "a:contains('Sally')" once I see it
    And I wait until element "#course-dropdown" is visible
    And I select the "allthethings *" option in dropdown "course-dropdown"
    And I wait until I see selector "a[href*='/s/allthethings/stage/2/puzzle/1']"
    Then selector "a[href*='/s/allthethings/stage/2/puzzle/1']" has class "perfect"
    But selector "a[href*='/s/allthethings/stage/2/puzzle/2']" doesn't have class "perfect"

  Scenario: Loading section projects
    Given I create a teacher-associated student named "Sally"
    And I am on "http://studio.code.org/projects/applab"

    # Make sure the initial save doesn't interfere with renaming the project
    And I wait for initial applab save to complete

    # rename the project
    And I click selector ".project_edit" once I see it
    And I wait until element ".project_name.header_input" is visible
    And I type "thumb wars" into ".project_name.header_input"
    And I click selector ".project_save"

    And I wait until element ".project_edit" is visible
    Then element ".project_name.header_text" contains text "thumb wars"
    And I sign out

    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard?sectionProjects=1/#sections"
    And I click selector "a:contains('SectionName')" once I see it
    And I click selector "a:contains('Projects')" once I see it
    And I wait until element "#projects-list" is visible
    And I click selector "a:contains('thumb wars')" once I see it
    And I go to the newly opened tab
    And I wait until element ".project_name.header_text:contains('thumb wars')" is visible
