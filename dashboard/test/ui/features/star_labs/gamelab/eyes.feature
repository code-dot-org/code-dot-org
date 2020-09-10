@eyes
@as_student
Feature: Game Lab Eyes

Scenario: Basic GameLab level
  When I open my eyes to test "gamelab eyes" using stitch mode "none"
  And I start a new Game Lab project
  Then I see no difference for "initial load" using stitch mode "none"
  When I switch to the animation tab
  Then I see no difference for "animation tab" using stitch mode "none"
  And I press ".animationList .newListItem" using jQuery
  Then I see no difference for "new animation" using stitch mode "none"
  And I close my eyes

Scenario: Game Lab Embed Level
  Given I am on the 3rd Game Lab test level
  When I open my eyes to test "Game Lab Embed Level"
  Then I see no difference for "initial load" using stitch mode "none"
  And I close my eyes
