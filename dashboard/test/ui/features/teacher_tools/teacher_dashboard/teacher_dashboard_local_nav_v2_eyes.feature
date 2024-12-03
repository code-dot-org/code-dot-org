@no_mobile
Feature: Using the V2 teacher dashboard local navigation - Eyes

  Scenario: Teacher can see the local navigation
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I wait for 15 seconds

#    And I complete the level on "http://studio.code.org/s/allthethings/lessons/10/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"
    Given I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

    When I click selector "a:contains(Untitled Section)" once I see it to load a new page

    Then I wait until element "#ui-test-teacher-sidebar" is visible

    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible

    And I wait until element "#ui-test-skeleton-progress-column" is not visible

    And I wait until element "#ui-test-not" is visible
