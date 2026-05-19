@no_mobile
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab initialization
    Given I create an authorized teacher-associated student named "Sally"

    # Assign a unit with a survey but no assessment
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I assign my section in row 1 to course "allthethingscourse" unit 1
    And I reload the page
    And I click selector "a:contains(View progress)" once I see it

    # Progress tab
    And I wait until element "#unit-selector-v2" is visible

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#unit-selector-v2" is visible
    And I wait until element "#assessment-selector" is visible
    And I select the "Anonymous student survey 2" option in dropdown "assessment-selector"
    Then I wait until element "div:contains(this survey is anonymous)" is visible
