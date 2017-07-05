@as_taught_student
@eyes
Feature: Contained Levels

Scenario: Applab with free response contained level
  When I open my eyes to test "applab contained level"
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  Then I press keys "This is my answer" for element ".response"
  And I see no difference for "answer entered"
  Then I press "runButton"
  And I see no difference for "level run"
  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/15"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "reloaded with contained level answered"
  Then I press "runButton"
  And I press "finishButton"
  And I see no difference for "finished level with contained level"
  And I press "continue-button"
  # Make sure continue takes us to next level
  And I wait until current URL contains "/stage/18/puzzle/16"
  Then I close my eyes

Scenario: Gamelab with multiple choice contained level
  When I open my eyes to test "gamelab contained level"
  Given I am on "http://studio.code.org/s/allthehiddenthings/stage/2/puzzle/1"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  Then I press "unchecked_0"
  And I see no difference for "answer entered"
  Then I press "runButton"
  And I see no difference for "level run"
  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthehiddenthings/stage/2/puzzle/1"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "reloaded with contained level answered"
  Then I press "runButton"
  And I press "finishButton"
  And I see no difference for "finished level with contained level"
  And I press "continue-button"
  # Make sure continue takes us to next level
  And I wait until current URL contains "/stage/2/puzzle/2"
  Then I close my eyes
