# This test is vulnerable to existing application state in the target
# environment and is skipped while PLC works to fix that.
@skip
@dashboard_db_access
@eyes
Feature: Teacher Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table#summary-csd-teachers" is visible

    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View all applications)"
    Then I wait until element "h2:contains('CS Discoveries Teacher Applications')" is visible
    Then I wait until element "table#quick-view" is visible

    # TODO (mehal): Re-enable these when the test is fixed for this
    And I open my eyes to test "Teacher Application Dashboard"
    #And I see no difference for "Teacher List View"

    # Access the Detail View by navigating to the first row's "view application" button href
    # rather than clicking so it does not open in a new tab.
    Then I wait until element "table#quick-view a.btn:contains(View Application)" is visible
    Then execute JavaScript expression "window.location = $('table#quick-view a.btn:contains(View Application):first()').prop('href')"
    Then I wait until element "#detail-view" is visible
    And I see no difference for "Teacher Detail View"

    Then I press the first "#admin-edit" element
    Then I wait until element "a:contains('(Admin) Edit Form Data')" is visible
    Then I click selector "a:contains('(Admin) Edit Form Data')"
    Then I wait until current URL contains "/edit"
    Then I wait until element "#form-data-edit" is visible
    And I see no difference for "Admin Edit View"

    Then I click selector ".breadcrumb a:contains('Application Dashboard')"
    Then I wait until element "table#summary-csd-teachers" is visible
    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View accepted cohort)"
    Then I wait until element "table#cohort-view" is visible
    And I see no difference for "Teacher Cohort View"
    And I close my eyes
