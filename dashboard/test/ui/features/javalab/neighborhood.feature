@eyes
  Feature: NeighborhoodPainting
    
Scenario: Paint Glomming Shapes
  Given I create a levelbuilder named "Simone"
  When I open my eyes to test "Paint Glomming Shapes"
  Given I am on "http://studio.code.org/s/allthethings/lessons/44/levels/7"
  And I rotate to landscape
  Then I set slider speed to fast
  Then I press "runButton"
  And I wait for 20 seconds
  And I see no difference
  Then I close my eyes
