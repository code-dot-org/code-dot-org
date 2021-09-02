@eyes
Feature: NeighborhoodPainting

@no_circle
  Scenario: Paint Glomming Shapes
    When I open my eyes to test "Paint Glomming Shapes"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/7"
    And I wait for the page to fully load
    Then I press "#levelbuilder-menu-toggle" using jQuery
    Then I set slider speed to fast
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "paint glomming" using stitch mode "none"
    Then I close my eyes

  #Scenario: Stop Button Closes Connection
    #Given I create a levelbuilder named "Simone"
    #And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/7"
    #And I rotate to landscape
    #And I wait for the page to fully load
    #Then element "#runButton" is visible
    #Then I press "runButton"
    ## Check here for a "connection closed" message
    #Then I press "runButton"
