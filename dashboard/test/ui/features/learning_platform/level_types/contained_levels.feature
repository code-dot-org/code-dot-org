@eyes
Feature: Contained Levels

  Background:
    Given I create an authorized teacher-associated student named "Lillian"
    Then I sign in as "Lillian"

Scenario: Applab with free response contained level
  When I open my eyes to test "applab contained level"
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  Then I press keys "This is my answer" for element ".response"
  And I see no difference for "answer entered"
  Then I press "runButton"
  And I see no difference for "level run"
  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "reloaded with contained level answered"
  Then I press "runButton"
  And I press "finishButton"
  And I see no difference for "finished level with contained level"
  And I press "continue-button"
  # Make sure continue takes us to next level
  And I wait until current URL contains "/lessons/18/levels/16"
  Then I close my eyes

Scenario: GameLab with a submittable contained level
  When I open my eyes to test "gamelab submittable contained level"
  Given I am on "http://studio.code.org/s/allthethings/lessons/41/levels/7"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load" using stitch mode "none"
  Then I press "unchecked_0"
  And I see no difference for "answer entered" using stitch mode "none"
  Then I press "runButton"
  And I see no difference for "level run" using stitch mode "none"
  And I press "submitButton"
  And I press "confirm-button"
  And I wait until current URL contains "/lessons/41/levels/8"
  Then I close my eyes

Scenario: Gamelab with multiple choice contained level
  When I open my eyes to test "gamelab multiple choice contained level"
  Given I am on "http://studio.code.org/s/allthethings/lessons/41/levels/2"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load" using stitch mode "none"
  Then I press "unchecked_0"
  And I see no difference for "answer entered" using stitch mode "none"
  Then I press "runButton"
  And I see no difference for "level run" using stitch mode "none"
  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthethings/lessons/41/levels/2"
  And I rotate to landscape
  And I wait for the page to fully load
  And I see no difference for "reloaded with contained level answered" using stitch mode "none"
  Then I press "runButton"
  And I press "finishButton"
  And I see no difference for "finished level with contained level" using stitch mode "none"
  And I press "continue-button"
  # Make sure continue takes us to next level
  And I wait until current URL contains "/lessons/41/levels/3"
  Then I close my eyes

Scenario: Authorized Teacher on Maze with free response contained level
  When I open my eyes to test "maze free response contained level"
  Given I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/6"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  And I press keys "Here is my response!" for element ".response"
  And I see no difference for "answer entered"
  # Check that answer shows in teacher only tab
  Then I press the first ".uitest-teacherOnlyTab" element
  And I wait to see ".editor-column"
  And element ".editor-column" contains text "For Teachers Only"
  And I see no difference for "free response answer for teacher"
  Then I press "runButton"
  And I see no difference for "level run"
  Then I close my eyes

Scenario: Authorized Teacher on App Lab with free response contained level
  When I open my eyes to test "applab free response contained level"
  Given I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/3"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  And I press keys "Here is my response!" for element ".response"
  And I see no difference for "answer entered"
  # Check that answer shows in teacher only tab
  Then I press the first ".uitest-teacherOnlyTab" element
  And I wait to see ".editor-column"
  And element ".editor-column" contains text "For Teachers Only"
  And I see no difference for "free response answer for teacher"
  Then I press "runButton"
  And I see no difference for "level run"
  Then I close my eyes

Scenario: Unauthorized Teacher on Maze with multiple choice contained level
  When I open my eyes to test "maze multi contained level"
  Given I create a teacher-associated student named "Sally"
  And I sign in as "Teacher_Sally" and go home
  Then I am on "http://studio.code.org/s/coursee-2019/lessons/4/levels/2"
  And I rotate to landscape
  And I wait for the page to fully load
  Then I see no difference for "initial load"
  Then I press "unchecked_0"
  And I see no difference for "answer entered"
  # Check that answer shows in teacher only tab
  Then I press the first ".uitest-teacherOnlyTab" element
  And I wait to see ".editor-column"
  And element ".editor-column" contains text "Answer"
  And I see no difference for "multiple choice answer for teacher"
  Then I press "runButton"
  And I see no difference for "level run"
  Then I close my eyes
