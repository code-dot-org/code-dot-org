Feature: Basic navigation for PLC stuff

Background:
  Given I am a teacher
  And I am enrolled in a plc course
  Given I am on "http://studio.code.org/courses/All%20The%20PLC%20Things"
  And I wait to see ".course_unit_sections"

Scenario: Basic navigation and ribbon changing works as expected
  Then I verify progress for the selector ".course_unit_section a:nth-child(2) .ribbon" is "not_started"
  Then I verify progress for the selector ".course_unit_section a:nth-child(3) .ribbon" is "not_started"
  Then I verify progress for the selector ".course_unit_section a:nth-child(4) .ribbon" is "not_started"
  Then I click selector ".course_unit_title a"
  And I get redirected to "/s/alltheplcthings" via "dashboard"
  And I wait to see ".uitest-plcbreadcrumb"
  Then I fake completion of the assessment
  Then I click selector ".uitest-plcbreadcrumb a"
  And I get redirected to "/courses/All%20The%20PLC%20Things" via "dashboard"
  And I wait to see ".course_unit_sections"
  Then I verify progress for the selector ".course_unit_section a:nth-child(3) .ribbon" is "completed"
  Then I click selector ".course_unit_section a:nth-child(4)"
  And I get redirected to "/s/alltheplcthings" via "dashboard"
  Given I am on "http://studio.code.org/s/alltheplcthings/stage/10/puzzle/6"
  And I wait to see ".submitButton"
  Then I type "Test Answer" into "textarea"
  Then I click selector ".submitButton"
  And I get redirected to "/s/alltheplcthings/stage/10/puzzle/7" via "dashboard"
  Given I am on "http://studio.code.org/courses/All%20The%20PLC%20Things"
  And I wait to see ".course_unit_sections"
  Then I verify progress for the selector ".course_unit_section a:nth-child(4) .ribbon" is "in_progress"
