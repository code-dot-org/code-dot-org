# Sign up for account through /join/:section_code endpoint with invalid and valid form inputs
# Users see sign up form when they attempt to join section without being signed in
Feature: Using the join section page while not signed in

  Scenario: Attempt to join section while signed out
    Given I am on "http://studio.code.org/join"
    And I wait until element "a:contains(Create an account)" is visible
    Then I click selector "a:contains(Create an account)"
    And I wait until I am on "http://studio.code.org/users/sign_up/account_type?user_return_to=%2Fjoin"

  Scenario: Attempt to join section while signed in
    Given I am a teacher
    And I create a new student section assigned to course "allthethingscourse" unit 1 and save the section

    # Have new user join section with valid form inputs
    Given I sign out
    Given I am a student
    And I join the section
    Then I wait until I am on "http://studio.code.org/courses/allthethingscourse/units/1"
