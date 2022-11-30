@no_mobile
@dashboard_db_access

Feature: Teacher Application Detail View

  Scenario: Regional Partner can set Principal Approval as Not Required and Required
    Given I am a program manager with a regional partner and teacher application
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table#summary-csp-teachers" is visible

    Then I click selector "table#summary-csp-teachers ~ .btn:contains(View all applications)"
    Then I wait until element "#status-filter" is visible
    Then I click selector "button:contains('Make not required')"
    And I wait until element "button:contains('Make required')" is visible

    # Access the Detail View by navigating to the first row's "view application" button href
    # rather than clicking so it does not open in a new tab.
    Then I wait until element "table#quick-view a.btn:contains(View Application)" is visible
    Then execute JavaScript expression "window.location = $('table#quick-view a.btn:contains(View Application):first()').prop('href')"
    Then I wait until element "#detail-view" is visible
    Then I scroll the "#change-principal-approval-requirement" element into view
    Then I click selector "button:contains('Make required')"
    And I wait until element "button:contains('Make not required')" is visible