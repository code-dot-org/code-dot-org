@dashboard_db_access
Feature: Basic navigation for PLC stuff

Background:
  Given I am a teacher
  And I am enrolled in a plc course
  Given I am on "http://studio.code.org/course/csp-support"
  And I wait to see ".course_unit_sections"


Scenario: Basic navigation and ribbon changing works as expected
  Then elements ".ribbon" have css property "background-color" equal to "rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255)"
  Then I click selector ".course_unit_title a"
  And I get redirected to "/s/teachercon" via "dashboard"
  Then I fake completion of the assessment
  Then I click selector "#breadcrumb a"
  And I get redirected to "/course/csp-support" via "dashboard"
  And I wait to see ".course_unit_sections"
  Then element ".course_unit_section a:nth-child(3) .ribbon" has css property "background-color" equal to "rgb(14, 190, 14)"
  Then I click selector ".course_unit_section a:nth-child(4)"
  And I get redirected to "/s/teachercon" via "dashboard"
  Given I am on "http://studio.code.org/s/teachercon/stage/10/puzzle/6"
  And I wait to see ".submitButton"
  Then I type "Test Answer" into "textarea"
  Then I click selector ".submitButton"
  Given I am on "http://studio.code.org/course/csp-support"
  And I wait to see ".course_unit_sections"
  Then element ".course_unit_section a:nth-child(4) .ribbon" has css property "background-color" equal to "rgb(239, 205, 28)"


