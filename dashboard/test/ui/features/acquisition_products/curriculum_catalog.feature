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
    Then I click selector "a:contains(Sign in or create account)" to load a new page
    And I wait until element "h2:contains(Have an account already? Sign in)" is visible

  Scenario: Signed-in student does not see Assign button
    Given I create a student named "Student Sam"
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I wait until element "button:contains(Assign)" is not visible

  Scenario: Signed-in teacher without sections is prompted to created sections when clicking Assign
    Given I create a teacher named "Teacher Tom"
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    Then I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And I wait until element "h3:contains(Create class section to assign a curriculum)" is visible
    Then I click selector "a:contains(Create Section)"
    And I wait until current URL contains "/home"
    And I wait for jquery to load
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

  #Expanded card scenarios
  @no_mobile
  Scenario: Signed-out user sees the curriculum catalog with offerings and can expand card and view recommendations
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    And I click selector "[aria-label='View details about AI for Oceans']"
    And I wait until element "a:contains(See curriculum details)" is visible
    And I wait until element "#similarCurriculumImage" is visible
    And I wait until element "#similarCurriculumButton" is visible
    And I wait until element "#stretchCurriculumImage" is visible
    And I wait until element "#stretchCurriculumButton" is visible

  @no_mobile
  Scenario: Signed-out user sees course offering page when clicking on see curriculum details on expanded card
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "a:contains(See curriculum details)" to load a new page
    And I wait until element "h1:contains(AI for Oceans)" is visible

  @no_mobile
  Scenario: Signed-out user can navigate to facilitator led workshop through expanded card
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(CS Fundamentals: Course A)" is visible

    And I click selector "[aria-label='View details about CS Fundamentals: Course A']"
    Then I wait until element "a:contains(Facilitator led workshops)" is visible
    And I click selector "a:contains(Facilitator led workshops)"
    Then I wait for jquery to load
    And I wait until current URL contains "/professional-learning/elementary"

  @no_mobile
  Scenario: On expanded card, Signed-in teacher sees professional learning section
    Given I create a teacher named "Teacher Tom"
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(CS Fundamentals: Course A)" is visible
    And I click selector "[aria-label='View details about CS Fundamentals: Course A']"
    And I scroll the "h4:contains(CS Fundamentals: Course A)" element into view
    And I wait until element "h4:contains(Professional Learning)" is visible

  @no_mobile
  Scenario: On expanded card, Signed-in student does not see professional learning section
    Given I create a student named "Student Sam"
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(CS Fundamentals: Course A)" is visible
    And I click selector "[aria-label='View details about CS Fundamentals: Course A']"
    And I wait until element "h4:contains(Professional Learning)" is not visible

  # Expanded Card Assign button scenarios
  @no_mobile
  Scenario: On expanded card, Signed-out user is redirected to sign-in page when clicking Assign to class sections
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='View details about AI for Oceans']"
    And I click selector "button:contains(Assign to class sections)"
    And I wait until element "h3:contains(Sign in or create account to assign a curriculum)" is visible
    Then I click selector "a:contains(Sign in or create account)" to load a new page
    And I wait until element "h2:contains(Have an account already? Sign in)" is visible

  @no_mobile
  Scenario: On expanded card, Signed-in student does not see Assign button
    Given I create a student named "Student Sam"
    Given I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='View details about AI for Oceans']"
    And I wait until element "span:contains(Assign to class sections)" is not visible
    And I wait until element "span:contains(Assign to class sections)" is not visible

  @no_mobile
  Scenario: On the expanded card, Signed-in teacher without sections is prompted to created sections when clicking Assign to class sections
    Given I create a teacher named "Teacher Tom"
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible

    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "button:contains(Assign to class sections)"
    And I wait until element "h3:contains(Create class section to assign a curriculum)" is visible
    Then I click selector "a:contains(Create Section)"
    And I wait until current URL contains "/home"
    And I wait for jquery to load
    And I wait until element "h3:contains(Create a new section)" is visible
  
  @no_mobile
  Scenario: On expanded card, Signed-in teacher with sections assigns and unassigns offerings to sections
    Given I am a teacher with student sections named Section 1 and Section 2

    # Assign a standalone unit
    And I am on "http://studio.code.org/catalog"
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "button:contains(Assign to class sections)"
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

    And I click selector "[aria-label='View details about Computer Science Principles']"
    And I click selector "button:contains(Assign to class sections)"
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
    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "button:contains(Assign to class sections)"
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

    And I click selector "[aria-label='View details about Computer Science Principles']"
    And I click selector "button:contains(Assign to class sections)"
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
  
  @only_mobile
  Scenario: On mobile, Signed-out User sees the Learn More button on Catalog Cards
    Given I am on "http://studio.code.org/catalog"
    And I rotate to portrait
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Learn more about AI for Oceans']"
    And I wait until current URL contains "/oceans"
  
  @only_mobile
  Scenario: On mobile, Signed-in teacher sees the Learn More button on Catalog Cards
    Given I create a teacher named "Teacher Tom"
    Given I am on "http://studio.code.org/catalog"
    And I rotate to portrait
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Learn more about AI for Oceans']"
    And I wait until current URL contains "/oceans"
  
  @only_mobile
  Scenario: On mobile, Signed-in student sees the Try Now button on Catalog Cards
    Given I create a student named "Student Sam"
    Given I am on "http://studio.code.org/catalog"
    And I rotate to portrait
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Try AI for Oceans now']"
    And I wait until current URL contains "/oceans"
  
  # Curriculum Catalog Filter tests
  
  Scenario: User can Select all and Clear all in Curriculum Catalog filters
    Given I am on "http://studio.code.org/catalog"
    Then I wait until element "#grade-dropdown-button" is visible
    Then I click selector "#grade-dropdown-button"
    And I wait until element "#select-all" is visible within element "#grade-dropdown"
    Then I click selector "#select-all"
    And the "Kindergarten" checkbox is selected
    And the "Grade 1" checkbox is selected
    And the "Grade 2" checkbox is selected
    And the "Grade 3" checkbox is selected
    And the "Grade 4" checkbox is selected
    And the "Grade 5" checkbox is selected
    And the "Grade 6" checkbox is selected
    And the "Grade 7" checkbox is selected
    And the "Grade 8" checkbox is selected
    And the "Grade 9" checkbox is selected
    And the "Grade 10" checkbox is selected
    And the "Grade 11" checkbox is selected
    And the "Grade 12" checkbox is selected
    And I wait until element "#clear-all" is visible within element "#grade-dropdown"
    Then I click selector "#clear-all"
    And the "Kindergarten" checkbox is not selected
    And the "Grade 1" checkbox is not selected
    And the "Grade 2" checkbox is not selected
    And the "Grade 3" checkbox is not selected
    And the "Grade 4" checkbox is not selected
    And the "Grade 5" checkbox is not selected
    And the "Grade 6" checkbox is not selected
    And the "Grade 7" checkbox is not selected
    And the "Grade 8" checkbox is not selected
    And the "Grade 9" checkbox is not selected
    And the "Grade 10" checkbox is not selected
    And the "Grade 11" checkbox is not selected
    And the "Grade 12" checkbox is not selected
  
  
  Scenario: User can use Clear filters button to clear all selected filters
    Given I am on "http://studio.code.org/catalog"
    Then I wait until element "#grade-dropdown-button" is visible
    Then I click selector "#grade-dropdown-button"
    Then I click selector "span:contains(Kindergarten)"
    And the "Kindergarten" checkbox is selected
    Then I wait until element "#duration-dropdown-button" is visible
    Then I click selector "#duration-dropdown-button"
    Then I click selector "span:contains(School Year)"
    And the "School Year" checkbox is selected
    Then I wait until element "#topic-dropdown-button" is visible
    Then I click selector "#topic-dropdown-button"
    Then I click selector "span:contains(Interdisciplinary)"
    And the "Interdisciplinary" checkbox is selected
    Then I wait until element "#device-dropdown-button" is visible
    Then I click selector "#device-dropdown-button"
    Then I click selector "span:contains(Computer)"
    And the "Computer" checkbox is selected
    Then I wait until element "#marketingInitiative-dropdown-button" is visible
    Then I click selector "#marketingInitiative-dropdown-button"
    Then I click selector "span:contains(AP CSA)"
    And the "AP CSA" checkbox is selected
    Then I wait until element "#clear-filters" is visible
    Then I click selector "#clear-filters"
    Then I wait until element "#grade-dropdown-button" is visible
    Then I click selector "#grade-dropdown-button"
    And the "Kindergarten" checkbox is not selected
    Then I wait until element "#duration-dropdown-button" is visible
    Then I click selector "#duration-dropdown-button"
    And the "School Year" checkbox is not selected
    Then I wait until element "#topic-dropdown-button" is visible
    Then I click selector "#topic-dropdown-button"
    And the "Interdisciplinary" checkbox is not selected
    Then I wait until element "#device-dropdown-button" is visible
    Then I click selector "#device-dropdown-button"
    And the "Computer" checkbox is not selected
    Then I wait until element "#marketingInitiative-dropdown-button" is visible
    Then I click selector "#marketingInitiative-dropdown-button"
    And the "AP CSA" checkbox is not selected

  @chrome
  Scenario: User can use Tab navigation on filters, Space to select and escape to close
    Given I am on "http://studio.code.org/catalog"
    Then I wait until element "#grade-dropdown-button" is visible
    Then I click selector "#grade-dropdown-button"
    Then I click selector "span:contains(Kindergarten)"
    And I press keys ":tab"
    And I press keys ":space"
    And the "Grade 1" checkbox is selected
    And I press keys ":escape"
    Then I wait until element ".dropdown-menu" is not visible

