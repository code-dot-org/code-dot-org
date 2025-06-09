Feature: Viewing and dismissing the login callout
# Build errors on clearing cookies on mobile, ie

Scenario: Should see callout on 20-hour farmer lesson
  Given I am on "http://studio.code.org/courses/20-hour/units/1/lessons/9/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And element ".uitest-signincallout" is visible

@no_mobile
Scenario: Should be able to clear cookies and session storage to see callout again
  Given I am on "http://studio.code.org/courses/20-hour/units/1/lessons/9/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And element ".uitest-signincallout" is visible
  And I dismiss the login reminder
  And I reload the page
  And I delete the cookie named "hide_signin_callout"
  And I clear session storage
  And I reload the page
  And I wait for the lab page to fully load
  And element ".uitest-signincallout" is visible

@as_student
Scenario: Should not see callout on farmer lesson if logged in
  Given I am on "http://studio.code.org/courses/20-hour/units/1/lessons/9/levels/1?noautoplay=true"
  And I wait for the lab page to fully load
  And element ".uitest-signincallout" is not visible

@as_student
Scenario: Should not see callout on CSF coursea lesson if logged in
  Given I am on "http://studio.code.org/courses/coursea-2020/units/1/lessons/4/levels/2?noautoplay=true"
  And I wait for the lab page to fully load
  And element ".uitest-signincallout" is not visible
