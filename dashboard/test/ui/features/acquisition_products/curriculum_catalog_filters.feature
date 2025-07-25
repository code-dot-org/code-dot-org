Feature: Curriculum Catalog Filters
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
    And I wait until element "span:contains(Alfabetización Digital)" is visible
    Then I click selector "span:contains(Alfabetización Digital)"
    And I wait until element "h4:contains(Inteligencia Artificial para Océanos)" is not visible
    And I see no difference for "Curriculum Catalog: One Offering in Spanish"

    Then I click selector "#grade-dropdown-button"
    And I wait until element "span:contains(Grado 12)" is visible
    Then I click selector "span:contains(Grado 12)"
    And I wait until element "img ~ h5" is visible
    And I see no difference for "Curriculum Catalog: No Offerings in Spanish"
    And I close my eyes

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

