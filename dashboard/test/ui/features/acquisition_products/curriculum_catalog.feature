Feature: Curriculum Catalog Page
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
    And I wait until element "button:contains(New class section)" is visible

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
    And I wait until current URL contains "/professional-learning/workshops"

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
    And I wait until element "button:contains(New class section)" is visible

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

