@single_session
Feature: Using the join section page while not signed in

  Scenario: Join section while not signed in
    Given I am a teacher
    And I create a new section and go home
    And I save the section url

    # Have new user join section with invalid password
    Given I sign out
    And I attempt to join the section
    And I see "#student-terms"
    And I fill in the sign up form with invalid values for "Bob"
    Then I wait until element "#error_explanation" is visible
