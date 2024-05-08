@no_mobile
Feature: Using the V2 teacher dashboard

  Scenario: Teacher can open and close Icon Key and details
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I navigate to the V2 progress dashboard

    # toggle to V2 progress view
    And I wait until element "h6:contains(Icon Key)" is visible
    And I wait until element "#ui-test-progress-table-v2" is visible
    And element "#ui-test-progress-table-v2" is visible

    # Teacher can minimize icon key
    And I wait until element "strong:contains(Assignment Completion States)" is visible
    Then I click selector "h6:contains('Icon Key')"
    And element "strong:contains(Assignment Completion States)" is hidden
    Then I click selector "h6:contains('Icon Key')"
    And I wait until element "strong:contains(Assignment Completion States)" is visible

    # Teacher can open the more details of the icon key and close it
    Then I click selector "a:contains('More Details')"
    And I wait until element "h3:contains(Progress Tracking Icon Key)" is visible
    And I click selector "#ui-close-dialog"
    And element "h3:contains(Progress Tracking Icon Key)" is hidden

  Scenario: Teacher can open and close lessons and see level data cells
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I navigate to the V2 progress dashboard

    # Teacher can open lesson to view level data
    And I wait until element "#ui-test-lesson-header-2" is visible
    And I click selector "#ui-test-lesson-header-2"
    And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible

    # Teacher can close lesson so level data is no longer visible
    And I click selector "#ui-test-expanded-progress-column-header-2"
    And element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is not visible

  Scenario: Teacher can navigate to student work by clicking level cell.
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I navigate to the V2 progress dashboard

    # Teacher opens lesson data and clicks on level data cell
    And I wait until element "#ui-test-lesson-header-2" is visible
    And I click selector "#ui-test-lesson-header-2"
    And I click selector "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" once I see it to load a new tab
    And check that the URL contains "&user_id="
    And check that the URL contains "allthethings/lessons/2/levels/1"

  Scenario: Teacher can open lesson data, refresh the page, and lesson data will still be shown
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I navigate to the V2 progress dashboard

    # Open a lesson to see level data
    And I wait until element "#ui-test-lesson-header-2" is visible
    And I click selector "#ui-test-lesson-header-2"
    And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible

    # Verify the lesson is still open
    Then I reload the page
    And I wait until element "#ui-test-s-allthethings-lessons-2-levels-1-cell-data" is visible
