Feature: Age Gated Students Modal and Banner
  @eyes
  Scenario: Age gated students banner and modal for Teachers
    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved

    # Click on Age Gated Banner Learn More button to view Age Gated Students Modal
    When I open my eyes to test "Age Gated Students Banner and Modal"
    And I wait until element "#uitest-age-gated-banner" is visible
    Then I see no difference for "age gated students banner"

    And I click selector "a:contains(Learn more)"
    And I wait until element "#uitest-age-gated-students-modal" is visible
    Then I see no difference for "age gated students modal"
    And I close my eyes

  Scenario: Teacher viewing a section with no at risk age gated students should not see age gated students banner
    Given I create a teacher-associated under-13 student named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-age-gated-banner" is not visible

  Scenario: Teacher viewing a section with at risk age gated students should see age gated students banner and can click and see modal
    Given I create an authorized teacher-associated under-13 student in Colorado named "Sally"
    Given I am assigned to unit "allthethings"

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved

    # Click on Age Gated Banner Learn More button to view Age Gated Students Modal
    And I wait until element "#uitest-age-gated-banner" is visible
    And I click selector "a:contains(Learn more)"
    And I wait until element "#uitest-age-gated-students-modal" is visible
    And I wait until element "div:contains(Sally)" is visible
    And I click selector "button:contains(Close)"
    And I wait until element "#uitest-age-gated-students-modal" is not visible 
