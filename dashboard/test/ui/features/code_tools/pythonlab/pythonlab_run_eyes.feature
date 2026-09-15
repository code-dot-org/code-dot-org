@no_mobile
@eyes
Feature: Python Lab eyes

Scenario: Can run and see output of Python program
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/50/levels/1?hideProductTours=true"
  And I wait to see "#uitest-codebridge-run"
  And I wait until "#uitest-codebridge-run" is not disabled
  Then I open my eyes to test "run and see output of a Python program"
  And I see no difference for "initial load"
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "Hello from the start!"
  And I see no difference for "completed run"
  And I close my eyes

Scenario: Can write and submit a prediction
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/50/levels/5?hideProductTours=true"
  And I wait to see "#uitest-codebridge-run"
  Then I open my eyes to test "write and submit prediction for a Python program"
  And I see no difference for "initial load"
  And I type "this is a prediction" into "#uitest-predict-response"
  And I see no difference for "written prediction"
  And I close my eyes
