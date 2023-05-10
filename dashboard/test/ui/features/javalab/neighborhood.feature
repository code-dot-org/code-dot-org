@eyes
Feature: NeighborhoodPainting

@no_circle
  Scenario: Paint Glomming Shapes
    When I open my eyes to test "Javalab Neighborhood Paint Glomming"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/7"
    And I wait for the page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    Then I set slider speed to fast
    And I see no difference for "initial page load" using stitch mode "none"
    Then I press "runButton"
    And I wait until element ".javalab-console" contains text "[JAVALAB] Starting painter."
    And I wait for 7 seconds
    And I see no difference for "paint glomming" using stitch mode "none"
    Then I close my eyes

  #Scenario: Stop Button Closes Connection
    #Given I create a levelbuilder named "Simone"
    #And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/7"
    #And I wait for the page to fully load
    #Then element "#runButton" is visible
    #Then I press "runButton"
    ## Check here for a "connection closed" message
    #Then I press "runButton"
