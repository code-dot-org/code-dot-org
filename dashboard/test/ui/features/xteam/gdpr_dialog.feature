@no_mobile
Feature: GDPR Dialog - data transfer agreement

  Scenario: EU user sees the GDPR Dialog on dashboard, opt out
    Given I am in Europe
    And I am a teacher
    And I am on "http://studio.code.org/home"
    When element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-logout"
    Then I wait until I am on "http://code.org/"
    And I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU user sees the GDPR Dialog on dashboard, opt in, don't show again
    Given I am in Europe
    And I create a teacher named "Madame Maxime"
    And I am on "http://studio.code.org/home"
    When element ".ui-test-gdpr-dialog" is visible
    Then I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    And it is eventually observed that the "gdpr" script data field "show_gdpr_dialog" is "false"
    Given I am on "http://studio.code.org/home"
    Then I wait to see ".header_user"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
    Given I am in Europe
    And I create a student in the eu named "Viktor Krum"
    And I am on "http://studio.code.org/home"
    Then element ".ui-test-gdpr-dialog" is not visible

  Scenario: GDPR Dialog privacy link works from dashboard
    Given I am in Europe
    And I am a teacher
    And I am on "http://studio.code.org/home"
    When element ".ui-test-gdpr-dialog" is visible
    Then I press the first ".ui-test-gdpr-dialog-privacy-link" element to load a new tab
    Then check that I am on "http://code.org/privacy"

  Scenario: Accept, sign out, sign in again, no dialog
    Given I am in Europe
    And I create a teacher named "Madame Maxime"
    When I am on "http://studio.code.org/home"
    Then element ".ui-test-gdpr-dialog" is visible
    When I click selector ".ui-test-gdpr-dialog-accept"
    Then element ".ui-test-gdpr-dialog" is not visible
    And it is eventually observed that the "gdpr" script data field "show_gdpr_dialog" is "false"
    Then I sign out
    Given I sign in as "Madame Maxime" and go home
    Then I wait to see ".header_user"
    And element ".ui-test-gdpr-dialog" is not visible
