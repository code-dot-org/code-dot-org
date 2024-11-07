@eyes
Feature: Teacher can create a new account in new sign up flow

Scenario: Teacher can create a school associated account in the new sign up flow

  Given I am on "http://studio.code.org/users/new_sign_up/account_type"
  And I open my eyes to test "Teacher Sign up"
  And I see no difference for "Account Selection Page"
  And I press the last button with text "Sign up as a teacher" to load a new page
  And I press keys "testemail@code.org" for element "#emailInput"
  And I press keys "password" for element "#passwordInput"
  And I press keys "password" for element "#confirmPasswordInput"
  And I see no difference for "Login Type Selection Page"
  And I press the last button with text "Create my account" to load a new page
  And I press keys "myDisplayName" for element "#displayName"
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I press keys "31513" for element "#uitest-school-zip"
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  And I see no difference for "Finish Sign Up Teacher"
  When I press "user_email_preference_opt_in_no"
  And I press "#signup_finish_submit" using jQuery
  And I wait until I see selector "#uitest-accept-section-creation"
  And I close my eyes

Scenario: Student can create an account in the new sign up flow

  Given I am on "http://studio.code.org/users/new_sign_up/account_type"
  And I press the last button with text "Sign up as a student" to load a new page
  And I press keys "testemail@code.org" for element "#emailInput"
  And I press keys "password" for element "#passwordInput"
  And I press keys "password" for element "#confirmPasswordInput"
  And I press the last button with text "Create my account" to load a new page
  And I press keys "myDisplayName" for element "#displayName"
  And I select the "10" option in dropdown "userAge"
  And I select the "Washington" option in dropdown "userState"
  And I open my eyes to test "Finish Sign Up Student"
  And I see no difference for "Finish Sign Up Student"
  When I press "user_email_preference_opt_in_no"
  And I press "#signup_finish_submit" using jQuery
  And I wait until I see selector "#uitest-accept-section-creation"
  And I close my eyes
