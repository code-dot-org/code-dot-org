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

  # All students in sections are no longer considered at risk because they cannot be locked out unless they are removed from their section
  Scenario: Teacher viewing a section with at risk age gated students should see age gated students banner and can click and see modal
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally" after CAP start
    Given I am assigned to course "allthethingscourse" unit 1

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    Then I click selector "#section-options-dropdown-dropdown-button" once I see it
    Then I click selector "#ui-test-Section-settings" once I see it
    Then I click selector "a:contains(Progress)" once I see it
    And I wait until element "#uitest-age-gated-banner" is not visible
