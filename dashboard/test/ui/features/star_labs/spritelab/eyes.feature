@eyes
@as_student
Feature: Sprite Lab Eyes

Scenario: Basic Sprite Lab level
  When I open my eyes to test "sprite lab eyes"
  And I start a new Sprite Lab project
  And I wait until I don't see selector "#p5_loading"
  Then I see no difference for "initial load"
  And I've initialized the workspace for the sample Sprite Lab project
  Then I see no difference for "preview"
  Then I press "runButton"
  Then I see no difference for "run"
  And I close my eyes
