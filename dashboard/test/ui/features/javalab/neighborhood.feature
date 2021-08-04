@eyes
  Feature: NeighborhoodPainting
    
Scenario: Paint Glomming Shapes
  Given I create a levelbuilder named "Simone"
  When I open my eyes to test "Paint Glomming Shapes"
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/6"
  And I wait for the page to fully load
  Then element "#runButton" is visible
  Then I set slider speed to fast
  Then I press "runButton"
  And I wait for 20 seconds
  And I see no difference
  Then I close my eyes

#Scenario: Stop Button Closes Connection
 # Given I create a levelbuilder named "Simone"
  #And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/6"
  #And I rotate to landscape
  #And I wait for the page to fully load
  #Then element "#runButton" is visible
  #Then I set slider speed to medium
  #Then I press "runButton"
  #Then I press "runButton"
