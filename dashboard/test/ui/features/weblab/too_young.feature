Feature: Weblab Too Young

  @as_young_student
  Scenario: Weblab Redirected
    Given I am on "http://studio.code.org/projects/weblab/new"
    Then I wait until I am on "http://studio.code.org/home"
    And element ".alert-danger" contains text "This content has age restrictions in place"

  Scenario: Weblab Allowed for Student in Teacher's Section
    Given I create a teacher-associated under-13 student named "Luna"
    And I am on "http://studio.code.org/projects/weblab/new"
    And I wait until element "#workspace-header" is visible
    And I am on "http://studio.code.org/projects/weblab/new"