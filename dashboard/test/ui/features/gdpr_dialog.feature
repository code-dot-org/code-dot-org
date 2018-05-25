@dashboard_db_access

Feature: GDPR Dialog - data transfer agreement

  Scenario: EU user sees the GDPR Dialog on dashboard, opt out
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-logout"
    Then check that I am on "http://code.org/"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU user sees the GDPR Dialog on pegasus, opt out
    Given I am on "http://code.org/"
    And I am a teacher
    And I am on "http://code.org/teacher-dashboard?no_home_redirect=1&force_in_eu=1"
    Then I wait to see ".ui-test-gdpr-dialog"
    Then I click selector ".ui-test-gdpr-dialog-logout"
    Then check that I am on "http://code.org/"
    Then I am not signed in
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://code.org/teacher-dashboard?no_home_redirect=1&force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU user sees the GDPR Dialog on pegasus, opt in, don't show again
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://code.org/teacher-dashboard?no_home_redirect=1&force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible


  Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
    Given I create a student in the eu named "Viktor Krum"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: GDPR Dialog privacy link works from dashboard
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-privacy-link"
    Then I go to the newly opened tab
    Then check that I am on "http://code.org/privacy"

  Scenario: Accept, sign out, sign in again, no dialog
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    Then I sign out
    Given I sign in as "Madame Maxime"
    Given I am on "http://studio.code.org/home"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://code.org/teacher-dashboard?no_home_redirect=1&force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible
