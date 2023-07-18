Feature: Curriculum Catalog Page

  @eyes
  Scenario: Signed-out user sees the curriculum catalog with offerings and can filter
    Given I am on "http://studio.code.org/catalog"
    And I open my eyes to test "Curriculum Catalog"
    Then I wait until element "#topic-dropdown" is visible
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I see no difference for "Curriculum Catalog: All Offerings"

    Then I click selector "#topic-dropdown-button"
    And I wait until element "span:contains(Digital Literacy)" is visible
    Then I click selector "span:contains(Digital Literacy)"
    And I wait until element "h4:contains(AI for Oceans)" is not visible
    And I see no difference for "Curriculum Catalog: One Offering"

    Then I click selector "#grade-dropdown-button"
    And I wait until element "span:contains(Grade 12)" is visible
    Then I click selector "span:contains(Grade 12)"
    And I wait until element "h5:contains(No matching curricula)" is visible
    And I see no difference for "Curriculum Catalog: No Offerings"
    And I close my eyes

  # Assign button scenarios

  Scenario: Signed-out user is redirected to sign-in page when clicking Assign
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    Then I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And I wait until element "h3:contains(Sign in or create account to assign a curriculum)" is visible
    Then I click selector "a:contains(Sign in or create account)"
    And I wait until element "h2:contains(Have an account already? Sign in)" is visible

  Scenario: Signed-in student is redirected to help page when clicking Assign
    Given I create a student named "Student Sam"
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    Then I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And I wait until element "h3:contains(Use a teacher account to assign a curriculum)" is visible
    Then I click selector "a:contains(Learn how to update account type)"
    And I wait until current URL contains "/articles/360023222371-How-can-I-change-my-account-type-from-student-to-teacher-or-vice-versa"

  Scenario: Signed-in teacher without sections is prompted to created sections when clicking Assign
    Given I create a teacher named "Teacher Tom"
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    Then I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And I wait until element "h3:contains(Create class section to assign a curriculum)" is visible
    Then I click selector "a:contains(Create Section)"
    And I wait until element "h3:contains(Create a new section)" is visible
