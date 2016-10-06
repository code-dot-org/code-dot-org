@no_ie
@no_mobile
@dashboard_db_access
@pegasus_db_access
@no_circle
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
    And I complete the level on "http://learn.code.org/s/allthethings/stage/2/puzzle/1"
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
