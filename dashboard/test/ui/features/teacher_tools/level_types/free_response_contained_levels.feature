Feature: Free Response Contained Levels

  Background:
    Given I create an authorized teacher-associated student named "Lillian"
    Then I sign in as "Lillian"

@eyes
Scenario: Applab with free response contained level
  When I open my eyes to test "applab contained level"
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I wait for the lab page to fully load
  Then I see no difference for "initial load"
  Then I press keys "This is my answer" for element ".response"
  And I see no difference for "answer entered"
  Then I press "runButton"
  And I see no difference for "level run"
  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I wait for the lab page to fully load
  And I see no difference for "reloaded with contained level answered"
  Then I press "runButton"
  And I press "finishButton"
  And I see no difference for "finished level with contained level"
  And I press "continue-button"
  # Make sure continue takes us to next level
  And I wait until current URL contains "/lessons/18/levels/16"
  Then I close my eyes

@eyes
Scenario: Javalab with free response contained level
  When I open my eyes to test "javalab contained level"
  Given I am on "http://studio.code.org/s/allthethings/lessons/44/levels/6"
  And I wait to see ".response"
  And I scroll the ".response" element into view
  Then I see no difference for "initial load" using stitch mode "none"
  Then I press keys "This is my answer" for element ".response"
  And I see no difference for "answer entered" using stitch mode "none"
  Then I press "runButton"
  And I see no difference for "level run" using stitch mode "none"
  # Wait until we see at least one message on the console, this means the program saved.
  And I wait until element ".javalab-console" contains text "[JAVALAB]"

  # At this point, we should have submitted our result to the server, do
  # a reload and make sure we have the submission
  Then I am on "http://studio.code.org/s/allthethings/lessons/44/levels/6"
  And I wait to see ".response"
  And I see no difference for "reloaded with contained level answered" using stitch mode "none"
  Then I press "runButton"
  And I see no difference for "finished level with contained level" using stitch mode "none"
  Then I close my eyes

@eyes
Scenario: Authorized Teacher on Maze with free response contained level
  When I open my eyes to test "maze free response contained level"
  Given I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/6"
  And I wait for the lab page to fully load
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

@eyes
Scenario: Authorized Teacher on App Lab with free response contained level
  When I open my eyes to test "applab free response contained level"
  Given I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/3"
  And I wait for the lab page to fully load
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

Scenario: Teacher can reset progress on free response contained level
  Given I sign in as "Teacher_Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/3"
  And I wait for the lab page to fully load
  And I press keys "Here is my response!" for element ".response"
  And element ".response" has value "Here is my response!"
  Then I press "runButton"
  Then I press "resetButton"
  And I verify progress in the header of the current page is "perfect" for level 3
  Then I click selector "button:contains('Delete Answer')"
  And I wait until ".response" does not contain text "Here is my response!"
  And I wait for 5 seconds
  And I verify progress in the header of the current page is "not_tried" for level 3
  And I press keys "Here is my response!" for element ".response"
  And element ".response" has value "Here is my response!"
  Then I press "runButton"
  Then I press "resetButton"
  And I verify progress in the header of the current page is "perfect" for level 3

Scenario: Student can attempt retriable free response contained level multiple times
  Given I am on "http://studio.code.org/s/allthethings/lessons/41/levels/9"
  And I rotate to landscape
  And I wait for the lab page to fully load
  And I press keys "Here is my response!" for element ".response"
  And element ".response" has value "Here is my response!"
  Then I press "runButton"
  Then I press "resetButton"
  And I verify progress in the header of the current page is "perfect" for level 9
  # And element '.response' is not disabled
  Then I press keys " edited" for element ".response"
  And element ".response" has value "Here is my response! edited"
  Then I press "runButton"
  Then I press "resetButton"
  Then I am on "http://studio.code.org/s/allthethings/lessons/41/levels/9"
  And I rotate to landscape
  And I wait to see ".response"
  And element ".response" has value "Here is my response! edited"
  And I verify progress in the header of the current page is "perfect" for level 9
