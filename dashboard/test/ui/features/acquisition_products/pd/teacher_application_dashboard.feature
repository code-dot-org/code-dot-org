@eyes
Feature: Teacher Application Dashboard

  Scenario: View summary of all apps, apps in a course, detail view of one app, and cohort view of accepted apps
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table#summary-csa-teachers" is visible
    And I open my eyes to test "Teacher Application Dashboard"
    And I see no difference for "Admin Summary View"

    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View all applications)"
    Then I wait until element "#status-filter" is visible
    And I press keys "Withdrawn" for element "#status-filter"
    And I press the first ".Select-option" element
    Then I wait until element "span:contains('Withdrawn')" is visible
    And I wait until element "td:contains('Unreviewed')" is not visible
    And I see no difference for "Admin Course View"

    # Access the Detail View by navigating to the first row's "view application" button href
    # rather than clicking so it does not open in a new tab.
    Then I wait until element "table#quick-view a.btn:contains(View Application)" is visible
    Then execute JavaScript expression "window.location = $('table#quick-view a.btn:contains(View Application):first()').prop('href')"
    Then I wait until element "#detail-view" is visible
    And I see no difference for "Admin Detail View"

    Then I press the first "#admin-edit" element
    Then I wait until element "a:contains('(Admin) Edit Form Data')" is visible
    Then I click selector "a:contains('(Admin) Edit Form Data')"
    Then I wait until element "#form-data-edit" is visible
    And I see no difference for "Admin Edit View"

    Then I click selector ".breadcrumb a:contains('Application Dashboard')"
    Then I wait until element "table#summary-csp-teachers" is visible
    Then I click selector "table#summary-csp-teachers ~ .btn:contains(View accepted cohort)"
    Then I wait until element "table#cohort-view" is visible
    And I see no difference for "Admin Cohort View"
    And I close my eyes
