@dashboard_db_access

Feature: GDPR Dialog - data transfer agreement

  Scenario: EU user sees the GDPR Dialog on dashboard, opt out
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".ui-test-gdpr-dialog"
    Then I wait to see ".ui-test-gdpr-dialog-logout"
    Then I click selector ".ui-test-gdpr-dialog-logout"
    Then check that I am on "http://code.org/"

  Scenario: EU user sees the GDPR Dialog on dashboard, opt in
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".ui-test-gdpr-dialog"
    Then I click selector ".ui-test-gdpr-dialog-accept"
    # Confirm dialog closed and I can do something on this page
    And I create a new section

  Scenario: GDPR Dialog privacy link works
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".ui-test-gdpr-dialog"
    Then I click selector ".ui-test-gdpr-dialog-privacy-link"
    Then check that I am on "http://code.org/privacy"

  Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".ui-test-gdpr-dialog"
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then I sign out
    Given I sign in as "Madame Maxime"
    # Confirm dialog closed and I can do something on this page
    And I create a new section

  Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
    Given I create a student in the eu named "Viktor Krum"
    Given I am on "http://studio.code.org/home"
    # Confirm dialog closed and I can do something on this page
    Then I click selector "#header-student-projects"
    Then check that I am on "http://studio.code.org/projects#/"
