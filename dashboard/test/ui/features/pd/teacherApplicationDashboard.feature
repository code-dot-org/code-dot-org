@dashboard_db_access
@eyes

Feature: Teacher Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table" is visible
    Then I press the first "#application-container .col-xs-4:nth-child(4) .btn" element
    Then I wait until element "table" is visible
    And I open my eyes to test "Teacher Application Dashboard"
    And I see no difference for "Teacher List View"
    Then execute JavaScript expression "window.location = $('table a:first-child').first().prop('href')"
    Then I wait until element "h1" is visible
    And I see no difference for "Teacher Detail View"
    Then I press the first "#application-container a" element
    Then I wait until element "table" is visible
    Then I press the first "#application-container .col-xs-4:nth-child(4) .btn:nth-child(3)" element
    Then I wait until element "table" is visible
    And I see no difference for "Teacher Cohort View"
    And I close my eyes
