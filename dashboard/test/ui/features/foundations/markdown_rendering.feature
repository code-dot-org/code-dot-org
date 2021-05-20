Feature: Markdown rendering across the website

  Scenario: Visiting an external markdown level with details tag
    Given I am on "http://studio.code.org/s/allthethings/lessons/21/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait to see "#extra-details-tag"
    Then element "#extra-details-tag" is hidden
    And I press "summary-tag"
    Then element "#extra-details-tag" is visible

  @eyes
  Scenario: Viewing a level with blockly embedded in instructions
    When I open my eyes to test "Blockly in instructions"
    And I am on "http://studio.code.org/s/allthethings/lessons/21/levels/2?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I see no difference for "basic embedded blockly"
    And I close my eyes

    When I open my eyes to test "Blockly in K1 instructions"
    And I am on "http://studio.code.org/s/allthethings/lessons/21/levels/3?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I see no difference for "K1 embedded blockly"
    And I close my eyes

  @eyes
  Scenario: Visiting an External level with blockly xml in the Markdown
    When I open my eyes to test "Blockly in External level"
    And I am on "http://studio.code.org/s/allthethings/lessons/21/levels/1?noautoplay=true"
    And I rotate to landscape
    And I wait to see ".blocklySvg"
    Then I see no difference for "blockly on External level"
    And I close my eyes
