Feature: Ensure correct #belowVisualization position

  @eyes @as_student
  Scenario: Check correct position of video thumbnails
    Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1?noautoplay=true"
    And I wait for the page to fully load

    When I open my eyes to test "Video thumbnail position"
    Then I see no difference for "default visualization width" using stitch mode "none"

    When I drag the visualization grippy by 400 pixels
    Then I see no difference for "wider visualization" using stitch mode "none"

    When I drag the visualization grippy by -400 pixels
    Then I see no difference for "narrower visualization" using stitch mode "none"

    Then I close my eyes
