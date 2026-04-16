@chrome
@no_mobile
Feature: Global Edition - Farsi MVP - Teacher Dashboard

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: Teacher does not see Teacher Promotion right panel
    Given I create a teacher named "New Teacher"

    When I sign in as "New Teacher" and go home
    Then I wait until element "#ui-test-teacher-promotions" is visible

    When I select the "فارسی" option in dropdown "locale" to load a new page
    Then I wait until element "#ui-test-teacher-promotions" is not visible
