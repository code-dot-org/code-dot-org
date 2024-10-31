@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
@eyes
Feature: Python Lab eyes

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait to see "#uitest-codebridge-run"
  And I wait until "#uitest-codebridge-run" is not disabled

Scenario: Can run and see output of Python program
  And I open my eyes to test "run and see output of a Python program"
  And I see no difference for "initial load"
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "[PYTHON LAB] Program completed."
  And I see no difference for "completed run"
  And I close my eyes
