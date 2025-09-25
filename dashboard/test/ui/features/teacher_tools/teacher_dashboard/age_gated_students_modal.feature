Feature: Age Gated Students Modal and Banner

  Scenario: Teacher viewing a section with no at risk age gated students should not see age gated students banner
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create a teacher-associated under-13 student named "Sally"
    Given I am assigned to course "allthethingscourse" with teacher "Teacher_Sally" in a section named "CAP Section"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    Then I click selector "#task-button-View-progress-CAP-Section" once I see it
    And I wait until element "#uitest-age-gated-banner" is not visible
