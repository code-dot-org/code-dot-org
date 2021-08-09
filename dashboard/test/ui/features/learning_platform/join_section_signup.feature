# Sign up for account through /join/:section_code endpoint with invalid and valid form inputs
# Users see sign up form when they attempt to join section without being signed in
Feature: Using the join section page while not signed in

  Scenario: Join section while not signed in with invalid form inputs
    Given I am a teacher
    And I create a new section and go home
    And I save the section url

    # Have new user join section with invalid password
    Given I sign out
    And I attempt to join the section
    And I see "#student-terms"
    And I fill in the sign up form with invalid values for "Bob"
    Then I wait until element "#error_explanation" is visible

  Scenario: Join section while not signed in with valid form inputs
    Given I am a teacher
    And I create a new section and go home
    And I save the section url

    # Have new user join section with valid form inputs
    Given I sign out
    And I attempt to join the section
    And I see "#student-terms"
    And I fill in the sign up form with valid values for "ValidUser"
    Then I wait until I am on "http://studio.code.org/home"
