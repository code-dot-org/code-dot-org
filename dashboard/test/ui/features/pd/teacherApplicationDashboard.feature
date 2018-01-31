@dashboard_db_access
@eyes

Feature: Teacher Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and state
    And I am on "http://localhost-studio.code.org:3000/pd/application_dashboard/summary"
    Then I wait until element ".fa-pulse" is not visible
    Then I press the first "#application-container .col-xs-4:nth-child(4) .btn" element
    Then I wait until element ".fa-pulse" is not visible
    And I open my eyes to test "Teacher Application Dashboard"
    And I see no difference for "Teacher List View"
    Then I press the first "table .btn" element
    Then I wait until element ".fa-pulse" is not visible
    And I see no difference for "Teacher Detail View"
    Then I press the first "#application-container a" element
    Then I wait until element ".fa-pulse" is not visible
    Then I press the first "#application-container .col-xs-4:nth-child(4) .btn:nth-child(3)" element
    Then I wait until element ".fa-pulse" is not visible
    And I see no difference for "Teacher Cohort View"
    And I close my eyes
