@eyes
Feature: Hidden Stages

Scenario: Hidden Lessons - Teacher to Student
  When I open my eyes to test "hidden stages"
  Given I create an authorized teacher-associated student named "bobby"
  Then I sign in as "Teacher_bobby"
  Then I am on "http://studio.code.org/s/allthethings"
  And I wait to see ".uitest-togglehidden"
  Then I click selector ".uitest-togglehidden:nth(1) div:contains('Hidden')"
  And I see no difference for "teacher overview with hidden stage"
  Then I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I see no difference for "student overview with hidden stage"
  Then I am on "http://studio.code.org/s/allthethings/lessons/2/levels/2"
  And I see no difference for "student lesson on hidden stage"
  And I close my eyes

Scenario: Hidden Lessons - Facilitator to Teacher
  When I open my eyes to test "hidden lessons - facilitator to teacher"
  Given I create facilitator associated teacher named "Maeve"
  Then I sign in as "Instructor_Maeve"
  Then I am on "http://studio.code.org/s/ui-test-teacher-pl-course"
  And I wait to see ".uitest-togglehidden"
  Then I click selector ".uitest-togglehidden:nth(1) div:contains('Hidden')"
  And I see no difference for "instructor overview with hidden lesson"
  Then I sign in as "Maeve"
  And I am on "http://studio.code.org/s/ui-test-teacher-pl-course"
  And I see no difference for "participant overview with hidden lesson"
  Then I am on "http://studio.code.org/s/ui-test-teacher-pl-course/lessons/2/levels/2"
  And I see no difference for "participant level on hidden lesson"
  And I close my eyes
