Feature: Viewing and dismissing the login callout

  @no_mobile
  Scenario: Clicking anywhere should dismiss the login reminder
    Given I am on "http://studio.code.org/courses/coursea-2020/units/1/lessons/5/levels/3?noautoplay=true"
    And I wait for the lab page to fully load
    And element ".uitest-signincallout" is visible
    And I dismiss the login reminder
    And element ".instructions-markdown p" has text "Use 2 movement blocks to get the Scrat to the acorn."
    Then element "#runButton" is visible
    And I delete the cookie named "hide_signin_callout"
    And I clear session storage

  Scenario: See age callout, not signin callout on hour of code
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/37/levels/2?noautoplay=true"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 10 in the age dialog

  @no_mobile
  Scenario: After dismissing the callout, it should not reappear upon refresh
    Given I am on "http://studio.code.org/courses/coursea-2020/units/1/lessons/5/levels/3?noautoplay=true"
    And I wait for the lab page to fully load
    And element ".uitest-signincallout" is visible
    And I dismiss the login reminder
    Then I reload the page
    Then element ".uitest-signincallout" is not visible
    And I delete the cookie named "hide_signin_callout"
    And I clear session storage

  @no_mobile
  Scenario: Nested callouts should work as expected
    Given I am on "http://studio.code.org/courses/coursea-2020/units/1/lessons/2/levels/2?noautoplay=true"
    And I wait for the lab page to fully load
    And element ".uitest-signincallout" is visible
    And I dismiss the login reminder
    And I wait until element ".csf-top-instructions p" is visible
    And I delete the cookie named "hide_signin_callout"
    And I clear session storage

  Scenario: Should be immediately redirected to sign in if pressing sign in button
    Given I am on "http://studio.code.org/courses/coursea-2020/units/1/lessons/2/levels/2?noautoplay=true"
    And I wait for the lab page to fully load
    And element ".uitest-signincallout" is visible
    And I click selector ".header_button" if I see it
    Then I am on "http://studio.code.org/users/sign_in"
