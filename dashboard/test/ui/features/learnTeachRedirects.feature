@no_mobile

Feature: Learn/Teach redirects

Scenario: Educate
  Given I am on "https://code.org/educate"
  Then I wait until I am on "http://studio.code.org/courses?view=teacher"

Scenario: Teach
  Given I am on "https://code.org/teach"
  Then I wait until I am on "http://studio.code.org/courses?view=teacher"

Scenario: Student
  Given I am on "https://code.org/student"
  Then I wait until I am on "https://studio.code.org/courses"
