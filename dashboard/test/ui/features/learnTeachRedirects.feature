@no_mobile

Feature: Learn/Teach redirects

Scenario: Educate
  Given I am on "http://code.org/educate"
  Then I wait until I am on "http://studio.code.org/courses?view=teacher"

Scenario: Teach
  Given I am on "http://code.org/teach"
  Then I wait until I am on "http://studio.code.org/courses?view=teacher"

Scenario: Student
  Given I am on "http://code.org/student"
  Then I wait until I am on "http://studio.code.org/courses"
