@dashboard_db_access
Feature: Workshop Enrollment

Scenario: Attempting to join workshop signed-out prompts user to sign in
  Given I am a "signed_out" user enrolling in workshop with "unsubmitted" status
  And I wait until element "a:contains('Create an account')" is visible

  # test clean up
  And I delete the workshop

Scenario: Attempting to join workshop as a student prompts user to upgrade account
  Given I am a "student" user enrolling in workshop with "unsubmitted" status
  And I wait until element "a:contains('Exit and cancel')" is visible

  # test clean up
  And I delete the workshop

Scenario: Attempting to join invalid workshop as a teacher states it cannot be found
  Given I am a teacher
  And I am on "http://studio.code.org/pd/workshops/0/join"
  And I wait until element "h3:contains('Not found')" is visible

Scenario: Attempting to join closed workshop as a teacher states it is closed
  Given I am a "teacher" user enrolling in workshop with "closed" status
  And I wait until element "h3:contains('Closed')" is visible

  # test clean up
  And I delete the workshop
