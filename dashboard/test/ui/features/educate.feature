@no_mobile

Feature: Educate page

Scenario: Educate
  Given I am on "http://code.org/educate"
  Then I wait until I am on "http://studio.code.org/courses?view=teacher"
