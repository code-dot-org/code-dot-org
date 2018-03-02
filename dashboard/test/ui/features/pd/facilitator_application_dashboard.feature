@dashboard_db_access
@eyes

Feature: Facilitator Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table" is visible
    And I open my eyes to test "Facilitator Application Dashboard"
    And I see no difference for "Application Dashboard"
    Then I press the first ".row .btn" element
    Then I wait until element "table" is visible
    And I see no difference for "Facilitator List View"
    # Do this so the detail view does not open in a new tab
    Then execute JavaScript expression "window.location = $('table a:first-child').first().prop('href')"
    Then I wait until element "h1" is visible
    And I see no difference for "Facilitator Detail View"
    Then I press the first "#application-container a" element
    Then I wait until element "table" is visible
    Then I press the first "#application-container .btn:nth-child(3)" element
    Then I wait until element "table" is visible
    And I see no difference for "Facilitator Cohort View"
    And I close my eyes
