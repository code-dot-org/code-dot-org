@no_ie
@no_mobile
@pegasus_db_access
Feature: Using the teacher dashboard

Background:
  Given I am on "http://code.org/"
  And I am a teacher

Scenario: Loading the teacher dashboard
  Given I am on "http://code.org/teacher-dashboard"
  Then I wait to see ".btn-default"
  Then I click selector "button:contains('View and manage your students')"
  Then check that I am on "http://code.org/teacher-dashboard#/sections"
