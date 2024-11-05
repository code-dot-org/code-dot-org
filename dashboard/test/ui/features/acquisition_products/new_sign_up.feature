@eyes
Feature: Teacher can create a new account in new sign up flow

Scenario: Teacher can create a school associated account in the new sign up flow

  Given I am on "http://studio.code.org/users/new_sign_up/account_type"
  And I press "#teacher-card" using jQuery
  And I press keys "testemail@code.org" for element "#emailinput"
  And I press keys "password" for element "#passwordinput"
  And I press keys "password" for element "#confirmpasswordinput"
  And I press "#createAccountButton" using jQuery
  And I press keys "myDisplayName" for element "#user_name"
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I press keys "31513" for element "#uitest-school-zip"
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  And I open my eyes to test "Finish Sign Up"
  And I see no difference for "Finish Sign Up"
  When I press "user_email_preference_opt_in_no"
  And I press "#signup_finish_submit" using jQuery
  And I wait until I see selector "#uitest-accept-section-creation"
  And I close my eyes
