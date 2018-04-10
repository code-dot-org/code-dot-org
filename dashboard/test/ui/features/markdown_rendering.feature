Feature: Markdown rendering across the website

  # IE9 issue parsing DOM https://www.pivotaltracker.com/story/show/98498754
  @no_ie
  Scenario: Visiting an external markdown level with details tag
    Given I am on "http://studio.code.org/s/allthethings/stage/21/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait to see "#extra-details-tag"
    Then element "#extra-details-tag" is hidden
    And I click selector "#summary-tag"
    Then element "#extra-details-tag" is visible

  @eyes
  Scenario: Viewing a level with blockly embedded in instructions
    When I open my eyes to test "Blockly in instructions"
    And I am on "http://studio.code.org/s/allthethings/stage/21/puzzle/2?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I close the instructions overlay if it exists
    Then I see no difference for "basic embedded blockly"
    And I close my eyes

    Then I am on "http://studio.code.org/s/allthethings/stage/21/puzzle/3?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I close the instructions overlay if it exists
    Then I see no difference for "K1 embedded blockly"
    And I close my eyes
