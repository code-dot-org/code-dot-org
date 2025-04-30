@chrome
@no_mobile
Feature: Promotion - US map
#  @eyes
  Scenario: User interacts with the US map
    Given I am on "http://studio.code.org/promote/map"
    And I open my eyes to test "Promotion US map"

    When I wait until element "#map svg" is visible
    And element "#state-dropdown" is hidden
    And the href of selector "a:contains(See a summary of state efforts)" contains "https://advocacy.code.org/stateofcs"
    And the href of selector "a:contains(The Conference Board)" contains "https://www.conference-board.org"
    And the href of selector "a:contains(National Center for Education Statistics)" contains "https://nces.ed.gov"
    And the href of selector "a:contains(More info)" contains "https://docs.google.com/document/d/1gySkItxiJn_vwb8HIIKNXqen184mRtzDX12cux0ZgZk/pub"
    Then I see no difference for "Default"

    When I click "#map #AK"
    And I wait until element "#state-title:contains(Alaska)" is visible
    And check that I am on "http://studio.code.org/promote/map/ak"
    And element "#state-dropdown" has value "AK"
    And the href of selector "a:contains(View state fact-sheet)" contains "https://code.org/assets/advocacy/stateofcs/2023/Alaska.pdf"
    And the href of selector "a:contains(Take action in your state)" contains "https://www.votervoice.net/Code/campaigns/58463/respond"
    And element "#hide-ap-stats" is hidden
    And I click "#show-ap-stats"
    And I wait until element "#hide-ap-stats" is visible
    Then I see no difference for "Alaska state"

    Then I close my eyes

  Scenario: User interacts with the US state selector
    Given I am on "http://studio.code.org/promote/map"

    When I change the browser window size to 600 by 720
    Then I wait until element "#state-dropdown" is visible
    And element "#map" is hidden

    When I select the "Alaska" option in dropdown "state-dropdown"
    And I wait until element "#state-title:contains(Alaska)" is visible
    Then check that I am on "http://studio.code.org/promote/map/ak"
