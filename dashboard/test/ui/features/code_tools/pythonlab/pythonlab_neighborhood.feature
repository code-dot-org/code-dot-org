@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
@eyes
Feature: Python Lab Neighborhood eyes

Background:
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/50/levels/10?noIntrojs=true"
  And I wait to see "#uitest-codebridge-run"
  And I wait until "#uitest-codebridge-run" is not disabled

Scenario: Can run and see output of Python program
  And I open my eyes to test "run and see output of Neighborhood"
  And I see no difference for "initial load"
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "10"
  And I see no difference for "completed run"
  And I close my eyes
