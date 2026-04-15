@no_mobile
Feature: Demo section card on the teacher homepage

  Scenario: Teacher with zero sections can create a practice section from the homepage
    Given I am a teacher
    And I am on "http://studio.code.org/teacher_dashboard/home"
    Then I wait until element "#ui-test-demo-section-card" is visible
    And element "#ui-test-demo-section-card" has text "High School Practice Section"
    When I click "#ui-test-demo-section-action-progress" once it exists
    Then I wait until current URL contains "/teacher_dashboard/sections/"
    And I wait until current URL contains "/progress"
