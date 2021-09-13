@eyes
@as_student
Feature: Sprite Lab Eyes

Scenario: Basic Sprite Lab level
  When I open my eyes to test "sprite lab eyes"
  And I start a new Sprite Lab project
  And I wait until I don't see selector "#p5_loading"

  Then I press "versions-header"
  And I wait until element "button:contains(Restore this Version):eq(0)" is visible
  And element "button.version-preview" is visible
  And I click selector "button:contains(Restore this Version):eq(0)"
  And I wait until element "#showVersionsModal" is gone
  And I wait until I don't see selector "#p5_loading"
  And I wait until there's an SVG image "/category_animals/bunny2.png"

  Then I see no difference for "initial load"
  And I've initialized the workspace for the sample Sprite Lab project
  Then I see no difference for "preview"
  Then I press "runButton"
  Then I see no difference for "run"
  And I close my eyes
