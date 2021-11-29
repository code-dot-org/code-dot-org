Feature: Viewing and dismissing the login callout
# Build errors on clearing cookies on mobile, ie

Scenario: Should see callout on 20-hour farmer lesson
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible

@no_mobile
@no_ie
Scenario: Should be able to clear cookies and session storage to see callout again
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible
  And I dismiss the login reminder
  And I reload the page
  And I delete the cookie named "hide_signin_callout"
  And I clear session storage
  And I reload the page
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible

@as_student
Scenario: Should not see callout on farmer lesson if logged in
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is not visible

@as_student
Scenario: Should not see callout on CSF coursea lesson if logged in
  Given I am on "http://studio.code.org/s/coursea-2020/lessons/4/levels/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is not visible

@no_mobile
@no_ie
Scenario: Clicking anywhere should dismiss the login reminder
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible
  And I dismiss the login reminder
  And element ".instructions-markdown p" has text "Hi, I'm a farmer. I need your help to flatten the field on my farm so it's ready for planting. Move me to the pile of dirt and use the \"remove\" block to remove it."
  Then element "#runButton" is visible
  And I delete the cookie named "hide_signin_callout"
  And I clear session storage

Scenario: See age callout, not signin callout on hour of code
  Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I wait for 3 seconds
  And I wait until I don't see selector "#p5_loading"
  And I select age 10 in the age dialog

@no_mobile
@no_ie
Scenario: After dismissing the callout, it should not reappear upon refresh
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible
  And I dismiss the login reminder
  Then I reload the page
  Then element ".uitest-login-callout" is not visible
  And I delete the cookie named "hide_signin_callout"
  And I clear session storage

@no_mobile
@no_ie
Scenario: Nested callouts should work as expected
  Given I am on "http://studio.code.org/s/coursea-2020/lessons/2/levels/2?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".uitest-login-callout" is visible
  And I dismiss the login reminder
  And I wait until element ".csf-top-instructions p" is visible
  And I delete the cookie named "hide_signin_callout"
  And I clear session storage

Scenario: Should be immediately redirected to sign in if pressing sign in button
  Given I am on "http://studio.code.org/s/20-hour/lessons/9/levels/1?noautoplay=true"
  And I wait for the page to fully load
  And I rotate to landscape
  And element ".uitest-login-callout" is visible
  And I click selector ".header_button" if I see it
  Then I am on "http://studio.code.org/users/sign_in"
