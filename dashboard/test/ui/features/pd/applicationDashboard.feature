@dashboard_db_access
@eyes

Feature: Application Dashboard view

  Scenario: Basic teacher application submission
    Given I am a workshop administrator with some applications of each type and state
    And I am on "http://localhost-studio.code.org:3000/pd/application_dashboard/summary"
    And I wait until element "table" is visible
    And I open my eyes to test "Application Dashboard"
    And I see no difference for "Application Dashboard"
    Then I press the first ".btn" element
    Then I wait until element "table" is visible
    And I see no difference for "List view"
    Then I press the first "#application-container a" element
    Then I wait until element "table" is visible
    Then I press the first "#application-container .btn:nth-child(3)" element
    Then I wait until element "table" is visible
    And I see no difference for "Cohort view"
