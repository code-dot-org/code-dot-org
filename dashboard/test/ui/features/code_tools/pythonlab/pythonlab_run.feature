@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
Feature: Python Lab run code

Background:
  Given I create a student named "Penelope"
  And I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait to see "#uitest-codebridge-run"
  And I wait until "#uitest-codebridge-run" is not disabled

Scenario: Can run and see output of Python program
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "Hello from the start!"
  Then I sign out
