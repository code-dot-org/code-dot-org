Feature: Curriculum Catalog Page

  # English version
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

  # Spanish version
  @eyes
  Scenario: Signed-out user sees the curriculum catalog with offerings and can filter
    Given I am on "http://studio.code.org/catalog/lang/es"
    Then I wait until I am on "http://studio.code.org/catalog?lang=es"
    And I open my eyes to test "Curriculum Catalog in Spanish"
    Then I wait until element "#topic-dropdown" is visible
    And I wait until element "h4:contains(Inteligencia Artificial para Océanos)" is visible
    And I see no difference for "Curriculum Catalog: All Offerings in Spanish"

    Then I click selector "#topic-dropdown-button"
    And I wait until element "span:contains(Alfabetización digital)" is visible
    Then I click selector "span:contains(Alfabetización digital)"
    And I wait until element "h4:contains(Inteligencia Artificial para Océanos)" is not visible
    And I see no difference for "Curriculum Catalog: One Offering in Spanish"

    Then I click selector "#grade-dropdown-button"
    And I wait until element "span:contains(Grado 12)" is visible
    Then I click selector "span:contains(Grado 12)"
    And I wait until element "img ~ h5" is visible
    And I see no difference for "Curriculum Catalog: No Offerings in Spanish"
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

  Scenario: Signed-in teacher with sections assigns and unassigns offerings to sections
    Given I am a teacher with student sections named Section 1 and Section 2

    # Assign a standalone unit
    And I am on "http://studio.code.org/catalog"
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"

    # Assign a course
    Then I wait until element "h4:contains(Computer Science Principles)" is visible
    And I click selector "[aria-label='Assign Computer Science Principles to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:nth(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click selector "button:contains(Confirm section assignments)"
    And element "p:contains(You have successfully assigned)" is visible

    # Confirm assignment
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is assigned to "Computer Science Principles" in the section table

    # Unassign standalone unit
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"

    # Unassign course unit
    Then I wait until element "h4:contains(Computer Science Principles)" is visible
    And I click selector "[aria-label='Assign Computer Science Principles to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:nth(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"
    And element "p:contains(You have successfully assigned)" is not visible

    # Confirm unassign
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is not assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is not assigned to "Computer Science Principles" in the section table

  Scenario: Signed-out user sees the curriculum catalog with offerings and can filter
    Given I am on "http://studio.code.org/catalog?quick_view=true"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    And I click selector "[aria-label='View details about AI for Oceans']"

