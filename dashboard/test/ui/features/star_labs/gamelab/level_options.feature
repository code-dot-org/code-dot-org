@as_student
Feature: Game Lab Level Options

Scenario: A level with the animation tab disabled hides the mode toggle
  Given I am on the 1st Game Lab test level
  Then element "#codeMode" does not exist
  And element "#animationMode" does not exist

Scenario: A level with the animation tab enabled shows the mode toggle
  Given I am on the 2nd Game Lab test level
  Then I see "#codeMode"
  And I see "#animationMode"

Scenario: A new project should always provide the animation tab
  Given I start a new Game Lab project
  Then I see "#codeMode"
  And I see "#animationMode"

Scenario: Initial animations are usable with no animation tab
  Given I am on the 1st Game Lab test level
  When I run the game
  Then I do not see "Unable to find an animation" in the Game Lab console

Scenario: Initial animations show up in the animation tab
  Given I am on the 2nd Game Lab test level
  When I switch to the animation tab
  Then I see 2 animations in the animation column
