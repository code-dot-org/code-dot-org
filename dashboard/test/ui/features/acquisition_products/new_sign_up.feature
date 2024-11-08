@eyes
Feature: Teacher can create a new account in new sign up flow

Scenario: Teacher can create a school associated account in the new sign up flow

  Given I am on "http://studio.code.org/users/new_sign_up/account_type"
  And I open my eyes to test "Teacher Sign up"
  And I see no difference for "Account Selection Page"
  And I press the last button with text "Sign up as a teacher" to load a new page
  And I fill in the new sign up email field with a random email
  And I press keys "password" for element "#uitest-password"
  And I press keys "password" for element "#uitest-confirm-password"
  And I see no difference for "Login Type Selection Page"
  And I press the last button with text "Create my account" to load a new page
  And I press keys "myDisplayName" for element "#uitest-display-name"
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I press keys "31513" for element "#uitest-school-zip"
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  And I see no difference for "Finish Sign Up Teacher"
  And I press the last button with text "Go to my account" to load a new page
  And I wait until I see selector "#uitest-accept-section-creation"
  And I close my eyes

Scenario: Student can create an account in the new sign up flow

  Given I am on "http://studio.code.org/users/new_sign_up/account_type"
  And I press the last button with text "Sign up as a student" to load a new page
  And I fill in the new sign up email field with a random email
  And I press keys "password" for element "#uitest-password"
  And I press keys "password" for element "#uitest-confirm-password"
  And I press the last button with text "Create my account" to load a new page
  And I press keys "myDisplayName" for element "#uitest-display-name"
  And I select the "10" option in dropdown "uitest-user-age"
  And I select the "Washington" option in dropdown "uitest-user-state"
  And I open my eyes to test "Finish Sign Up Student"
  And I see no difference for "Finish Sign Up Student"
  And I press the last button with text "Go to my account" to load a new page
  And I close my eyes
