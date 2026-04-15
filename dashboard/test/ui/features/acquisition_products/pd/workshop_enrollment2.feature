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

  Scenario: Attempting to join workshop as a teacher requires user info then allows enrolling and sends teacher to MyPL page
    Given I am a "teacher" user enrolling in workshop with "unsubmitted" status
    And I wait until element "p:contains('Add your full name')" is visible
    And I wait until element "a:contains('Edit')" is visible
    Then I click selector "a:contains('Edit')" to load a new page

    # add full name in account settings
    And I wait until current URL contains "users/edit"
    And I wait until element "h2:contains('Account information')" is visible
    Then I scroll the "input#given_name" element into view
    And I press keys "Reba" for element "input#given_name"
    Then I scroll the "input#family_name" element into view
    And I press keys "McEntire" for element "input#family_name"
    And I scroll the "button:contains(Update account information)" element into view
    Then I click selector "button:contains(Update account information)" to load a new page

    # join workshop
    And I wait until element "#joinWorkshop" is visible
    Then I click selector "#joinWorkshop" to load a new page
    And I wait until current URL contains "my-professional-learning"

    # test clean up
    And I delete the workshop
