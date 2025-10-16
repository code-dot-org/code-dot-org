Feature: Age Gated Sections Modal and Banner

  Scenario: Teacher viewing their section with no at risk age gated students should not see age gated sections banner
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create a teacher-associated under-13 student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    And I wait until element "#uitest-age-gated-sections-banner" is not visible

    # All students in sections are no longer considered at risk because they can not be locked out unless they are removed from their section
  Scenario: Teacher viewing their sections with at risk age gated students should not see age gated sections banner
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally" after CAP start
    Given I am assigned to course "allthethingscourse" unit 1

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    And I wait until element "#uitest-age-gated-sections-banner" is not visible
