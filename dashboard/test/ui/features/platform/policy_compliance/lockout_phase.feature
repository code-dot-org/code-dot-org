@no_mobile
Feature: Child Account Policy Lockout Phase
  Scenario: Student account Under-13 in Colorado created before CAP start cannot change age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student in Colorado named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is disabled
  Then element "#user_age" is disabled

  Scenario: Student account Under-13 not in Colorado created after CAP start can change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student named "Tandy" after CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled

  Scenario: Student account Under-13 not in Colorado created before CAP start can change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled

  Scenario: Student account Over-13 and in Colorado created after CAP start can change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a student in Colorado named "Tandy" after CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled

  Scenario: Student account Over-13 and in Colorado created before CAP start can change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a student in Colorado named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled

  Scenario: Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student using clever in Colorado named "Tandy" after CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is disabled
  Then element "#user_age" is disabled

  Scenario: Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student using clever in Colorado named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is disabled
  Then element "#user_age" is disabled

  Scenario: Student account under-13 and in Colorado created before CAP start using google cannot change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student using google in Colorado named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is disabled
  Then element "#user_age" is disabled

  Scenario: Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student using clever named "Tandy" after CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled

  Scenario: Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state
  Given I am on "http://studio.code.org"
  Given CPA all user lockout phase
  Given I create a young student using clever named "Tandy" before CAP start

  Given I am on "http://studio.code.org/users/edit"

  Then I wait to see "#user_age"
  Then I wait to see "#user_us_state"
  Then element "#user_us_state" is enabled
  Then element "#user_age" is enabled
