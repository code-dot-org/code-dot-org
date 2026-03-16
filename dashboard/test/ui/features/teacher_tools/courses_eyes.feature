@eyes
@no_mobile
Feature: Courses page

# Broke during the marketing-sites transition
@as_student
@pegasus_content
Scenario: Student courses
  Given I am on "http://studio.code.org/home"
  When I open my eyes to test "student courses"
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And I press "header-student-courses"
  And I wait to see "#student-page-header"
  And I see no difference for "student courses page"
  And I close my eyes

# Broke during the marketing-sites transition
@as_student
@pegasus_content
Scenario: Student courses, non-english
  When I open my eyes to test "student courses non-english"
  Given I am on "http://studio.code.org/home/lang/es"
  Then I wait until I am on "http://studio.code.org/home?lang=es"
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And I press "header-student-courses"
  And I wait to see "#student-page-header"
  And I see no difference for "student non-english courses page"
  And I close my eyes
