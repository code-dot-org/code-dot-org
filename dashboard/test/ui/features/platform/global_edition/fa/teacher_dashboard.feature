@chrome
@no_mobile
Feature: Global Edition - Farsi MVP - Teacher Dashboard

  Background:
    Given Global Edition is enabled

  Scenario: Teacher does not see Teacher Promotion right panel
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home

    When I am on "http://studio.code.org/teacher_dashboard/home"
    Then I wait until element "#teacher-home-header" is visible
    And I wait until element "#ui-test-teacher-promotions" is visible

    When I switch to the Global Edition region "fa"
    Then I wait until current URL contains "http://studio.code.org/fa/teacher_dashboard/home"
    And I wait until element "#teacher-home-header" is visible
    And I wait until element "#ui-test-teacher-promotions" is not visible
