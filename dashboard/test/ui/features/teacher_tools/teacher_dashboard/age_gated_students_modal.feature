Feature: Age Gated Students Modal and Banner
  @eyes
  Scenario: Age gated students banner and modal for Teachers
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally" after CAP start
    Given I am assigned to course "allthethingscourse" unit 1 with teacher "Teacher_Sally"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    Then I click selector "#section-options-dropdown-dropdown-button" once I see it
    And I click selector "#ui-test-Section-settings" once I see it
    Then I click selector "a:contains(Progress)" once I see it

    # Click on Age Gated Banner Students button to view Age Gated Students Modal
    When I open my eyes to test "Age Gated Students Banner and Modal"
    And I wait until element "#uitest-age-gated-banner" is visible
    Then I see no difference for "age gated students banner"

    And I click selector "a:contains(Students)"
    And I wait until element "#uitest-age-gated-students-modal" is visible
    Then I see no difference for "age gated students modal"
    And I close my eyes

  Scenario: Teacher viewing a section with no at risk age gated students should not see age gated students banner
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    Given I create a teacher-associated under-13 student named "Sally"
    Given I am assigned to course "allthethingscourse" with teacher "Teacher_Sally" in a section named "CAP Section"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "#ui-test-section-list" is visible
    Then I click selector "#task-button-View-progress-CAP-Section" once I see it
    And I wait until element "#uitest-age-gated-banner" is not visible

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
    And I wait until element "#uitest-age-gated-banner" is visible
    And I wait until element "h3" contains text "It's a bit empty here..."

    # Click on Age Gated Banner Students button to view Age Gated Students Modal
    And I wait until element "#uitest-age-gated-banner" is visible
    And I click selector "a:contains(Students)"
    And I wait until element "#uitest-age-gated-students-modal" is visible
    And I wait until element "div:contains(Sally)" is visible
    And I click selector "button:contains(Close)"
    And I wait until element "#uitest-age-gated-students-modal" is not visible
