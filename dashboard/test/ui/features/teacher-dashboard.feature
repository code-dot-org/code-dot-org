@no_ie
@no_mobile
@pegasus_db_access
Feature: Using the teacher dashboard

  Background:
    Given I am on "http://code.org/"
    And I am a teacher

  Scenario: Loading the teacher dashboard
    Given I am on "http://code.org/teacher-dashboard"
    Then I wait to see ".outerblock"
    Then I click selector "div:contains('Student Accounts and Progress')"
    Then check that I am on "http://code.org/teacher-dashboard#/sections"