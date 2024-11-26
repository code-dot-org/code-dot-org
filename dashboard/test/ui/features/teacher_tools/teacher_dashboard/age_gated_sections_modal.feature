Feature: Age Gated Sections Modal and Banner
  @eyes
  Scenario: Age gated sections banner and modal for Teachers
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally" after CAP start
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible

    # Click on Age Gated Banner Sections button to view Age Gated Sections Modal
    When I open my eyes to test "Age Gated Sections Banner and Modal"
    And I wait until element "#uitest-age-gated-sections-banner" is visible
    Then I see no difference for "age gated sections banner"

    And I click selector "a:contains(Sections)"
    And I wait until element "#uitest-age-gated-sections-modal" is visible
    Then I see no difference for "age gated sections modal"
    And I close my eyes

  Scenario: Teacher viewing their section with no at risk age gated students should not see age gated sections banner
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create a teacher-associated under-13 student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I wait until element "#uitest-age-gated-sections-banner" is not visible

  Scenario: Teacher viewing their sections with at risk age gated students should see age gated sections banner and can click and see modal
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally" after CAP start
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    # Click on Age Gated Banner Sections button to view Age Gated Sections Modal
    And I wait until element "#uitest-age-gated-sections-banner" is visible
    And I click selector "a:contains(Sections)"
    And I wait until element "#uitest-age-gated-sections-modal" is visible
    And I wait until element "div:contains(Sally)" is visible
    And I click selector "button:contains(Close)"
    And I wait until element "#uitest-age-gated-sections-modal" is not visible
