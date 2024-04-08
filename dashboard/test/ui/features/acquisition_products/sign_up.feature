Feature: Teacher can create a new account

Scenario: Teacher can create an account with the new school association flow

  Given I am on "http://studio.code.org/users/sign_up"
  And I type "myEmail@email.com" into "textarea:nth(0)" once I see it
  And I type "mypassword" into "textarea:nth(1)" once I see it
  And I type "mypassword" into "textarea:nth(2)" once I see it
  And I press "#signup_form_submit"
  # Add the experiment flag
  And I am on "http://studio.code.org/users/sign_up?enableExperiments=school_association_v2"
  And I press "#select-user-type-teacher-button"
  And I type "myDisplayName" into "textarea:nth(0)" once I see it
  And I select the "US" option in dropdown "user[school_info_attributes][country]"
  And I type "98112" into "textarea:nth(1)" once I see it