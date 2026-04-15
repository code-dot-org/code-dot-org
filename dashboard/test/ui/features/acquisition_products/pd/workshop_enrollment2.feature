@dashboard_db_access
Feature: Workshop Enrollment 2

  Scenario: Attempting to join full workshop as a teacher states it is full
    Given I am a "teacher" user enrolling in workshop with "full" status
    And I wait until element "h3:contains('Full')" is visible

    # test clean up
    And I delete the workshop

  Scenario: Attempting to join own workshop as a teacher states it is your own workshop
    Given I am a "teacher" user enrolling in workshop with "own" status
    And I wait until element "h3:contains('Your own workshop')" is visible

    # test clean up
    And I delete the workshop

  Scenario: Attempting to join workshop again as a teacher states you have already enrolled
    Given I am a "teacher" user enrolling in workshop with "duplicate" status
    And I wait until element "h3:contains('Duplicate enrollment')" is visible

    # test clean up
    And I delete the workshop

