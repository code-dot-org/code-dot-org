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
