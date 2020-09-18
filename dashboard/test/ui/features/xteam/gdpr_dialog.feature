@no_mobile

Feature: GDPR Dialog - data transfer agreement

  Scenario: EU user sees the GDPR Dialog on dashboard, opt out
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-logout"
    Then I wait until I am on "http://code.org/"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
    Given I create a student in the eu named "Viktor Krum"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is not visible

  # Skip on IE due to blocked pop-ups
  @no_ie
  Scenario: GDPR Dialog privacy link works from dashboard
    Given I am a teacher
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I press the first ".ui-test-gdpr-dialog-privacy-link" element to load a new tab
    Then check that I am on "http://code.org/privacy"

  Scenario: Accept, sign out, sign in again, no dialog
    Given I create a teacher named "Madame Maxime"
    Given I am on "http://studio.code.org/home?force_in_eu=1"
    Then element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    Then I sign out
    Given I sign in as "Madame Maxime" and go home
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible
