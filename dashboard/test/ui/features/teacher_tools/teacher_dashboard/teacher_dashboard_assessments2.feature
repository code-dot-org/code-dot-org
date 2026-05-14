@no_mobile
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab survey submissions
    Given I create an authorized teacher-associated student named "Sally"
    # Create all students first so that we can unlock the assessment for all of them at once
    And I create a student named "Student2"
    And I join the section
    And I create a student named "Student3"
    And I join the section
    And I create a student named "Student4"
    And I join the section
    And I create a student named "Student5"
    And I join the section

    When I sign in as "Teacher_Sally" and go home
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    And I wait until element "span:contains(Example CSP Assessment)" is visible
    And I open the lesson lock dialog for lockable lesson 3
    And I unlock the lesson for students
    And I wait until element ".modal-backdrop" is gone

    And I sign in as "Sally" and go home
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3"

    And I sign in as "Student2" and go home
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3"

    And I sign in as "Student3" and go home
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3"

    And I sign in as "Student4" and go home
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3"

    And I sign in as "Student5" and go home
    And I submit the assessment on "http://studio.code.org/courses/allthethingscourse/units/1/lockable/3/levels/1/page/3"

    # Assign a unit with an unlocked survey
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I assign my section in row 1 to course "allthethingscourse" unit 1
    And I reload the page
    And I click selector "a:contains(View progress)" once I see it

    # Progress tab
    And I wait until element "#unit-selector-v2" contains text "All the Things!"

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#unit-selector-v2" is visible
    Then I wait until element "h2:contains(Multiple choice questions overview)" is visible
