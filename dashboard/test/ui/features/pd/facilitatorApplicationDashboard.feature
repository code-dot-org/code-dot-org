@dashboard_db_access
@eyes

Feature: Facilitator Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element ".fa-pulse" is not visible
    And I open my eyes to test "Facilitator Application Dashboard"
    And I see no difference for "Application Dashboard"
    Then I press the first ".btn" element
    Then I wait until element ".fa-pulse" is not visible
    And I see no difference for "Facilitator List View"
    Then I press the first "table .btn" element
    Then I wait until element ".fa-pulse" is not visible
    And I see no difference for "Facilitator Detail View"
    Then I press the first "#application-container a" element
    Then I wait until element ".fa-pulse" is not visible
    Then I press the first "#application-container .btn:nth-child(3)" element
    Then I wait until element ".fa-pulse" is not visible
    And I see no difference for "Facilitator Cohort View"
    And I close my eyes