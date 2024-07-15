@eyes
Feature: Teacher can create a new account

Scenario: Teacher can create an account with the new school association flow

  Given I am on "http://studio.code.org/users/sign_up"
  And I fill in the sign up email field with a random email
  And I press keys "password" for element "#user_password"
  And I press keys "password" for element "#user_password_confirmation"
  And I press "#signup_form_submit" using jQuery
  And I click selector "#select-user-type-teacher" once I see it
  And I press keys "myDisplayName" for element "#user_name"
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I press keys "31513" for element "#uitest-school-zip"
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  And I open my eyes to test "School Association"
  And I see no difference for "School Association: all fields"
  When I press "user_email_preference_opt_in_no"
  And I press "#signup_finish_submit" using jQuery
  And I wait until I see selector "#uitest-accept-section-creation"
  And I close my eyes
