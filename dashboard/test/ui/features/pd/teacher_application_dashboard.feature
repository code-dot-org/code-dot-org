@dashboard_db_access
#@eyes

Feature: Teacher Application Dashboard view
#  Before do
#    And I create some fake applications of each type and status (for a Regional partner)
#  end
#After do |scenario|
#  steps "I delete all applications from regional partner \"Test Partner\""
#end
  Background:
    Given A regional partner "Test Partner for Teacher Application Dashboard" with some teacher applications

  Scenario: Application dashboard, list view, detail view, cohort view
#    Given I am a workshop administrator with some applications of each type and status
#    TODO: Create a new partner, save to instance variable, log in as workshop admin but view only data for that partner
#    Either using direct link https://studio.code.org/api/v1/pd/applications?regional_partner_value=none [partner_id]
#    Or use UI dropdown
    Given I am a workshop administrator
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
#    Then I wait until element "#regional-partner-dropdown" is visible
#    And I select the "Test Partner" option in dropdown "regional-partner-dropdown"
    Then I wait until element "table#summary-csd-teachers" is visible

    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View all applications)"
    Then I wait until element "h2:contains('CS Discoveries Teacher Applications')" is visible
    Then I wait until element "table#quick-view" is visible

    # TODO (mehal): Re-enable these when the test is fixed for this
    And I open my eyes to test "Teacher Application Dashboard"
#    And I see no difference for "Teacher Quick View"

    # Access the Detail View by navigating to the first row's "view application" button href
    # rather than clicking so it does not open in a new tab.
    Then I wait until element "table#quick-view a.btn:contains(View Application)" is visible
    Then execute JavaScript expression "window.location = $('table#quick-view a.btn:contains(View Application):first()').prop('href')"
    Then I wait until element "#detail-view" is visible
#    And I see no difference for "Teacher Detail View"

#   TODO: re-enable this
#    Then I press the first "#admin-edit" element
#    Then I wait until element "a:contains('(Admin) Edit Form Data')" is visible
#    Then I click selector "a:contains('(Admin) Edit Form Data')"
#    Then I wait until current URL contains "/edit"
#    Then I wait until element "#form-data-edit" is visible
#    And I see no difference for "Admin Edit View"

    Then I click selector ".breadcrumb a:contains('Application Dashboard')"
    Then I wait until element "table#summary-csd-teachers" is visible
    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View accepted cohort)"
    Then I wait until element "table#cohort-view" is visible
#    And I see no difference for "Teacher Cohort View"
#    And I close my eyes
    Then I delete all applications from regional partner "Test Partner for Teacher Application Dashboard"
