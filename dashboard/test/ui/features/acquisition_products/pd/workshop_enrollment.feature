@dashboard_db_access
Feature: Workshop Enrollment

Scenario: Attempting to join workshop signed-out prompts user to sign in
  Given I am a "signed_out" user enrolling in workshop with "unsubmitted" status
  And I wait until element "span:contains('Create an account')" is visible

  # test clean up
  And I delete the workshop

Scenario: Attempting to join workshop as a student prompts user to upgrade account
  Given I am a "student" user enrolling in workshop with "unsubmitted" status
  And I wait until element "span:contains('Exit and cancel')" is visible

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
