@eyes
@as_student
Feature: Eyes Tests for Top Instructions

Scenario: Top Instructions
  When I open my eyes to test "top instructions in CSF"
  And I am on "http://studio.code.org/s/course1/stage/4/puzzle/11?noautoplay=true"
  And I wait for the page to fully load
  Then I see no difference for "maze short instructions"

  And I am on "http://studio.code.org/s/course4/stage/3/puzzle/5?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "artist long instructions"
  Then I click selector ".fa-chevron-circle-up"
  And I see no difference for "artist long instructions collapsed"
  Then I click selector ".fa-chevron-circle-down"
  And I see no difference for "artist long instructions uncollapsed"

  Then I am on "http://studio.code.org/s/course1/stage/4/puzzle/5?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "maze short instructions with ani gif"

  Then I press "ani-gif-preview"
  And I see no difference for "maze ani gif dialog"

  Then I am on "http://studio.code.org/s/allthethings/stage/6/puzzle/2?noautoplay=true"
  And I wait for the page to fully load
  And I press "runButton"
  And I wait to see ".uitest-topInstructions-inline-feedback"
  And I see no difference for "farmer with hints"

  Then I press "lightbulb"
  And I see no difference for "farmer with hint prompt"

  Then I resize top instructions to "200" pixels tall
  And I see no difference for "farmer with expanded instructions"

  Then I press ".csf-top-instructions button:contains('Yes')" using jQuery
  And I wait to see ".block-space"
  And I see no difference for "farmer with block hint"

  Then I press "lightbulb"
  And I press ".csf-top-instructions button:contains('Yes')" using jQuery
  And I see no difference for "farmer with markdown hint"

  Then I press "lightbulb"
  And I press ".csf-top-instructions button:contains('Yes')" using jQuery
  And I see no difference for "farmer with video hint"

  Then I am on "http://studio.code.org/s/course4/stage/19/puzzle/3?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "Bee with starting hints"

  Then I am on "http://studio.code.org/s/course1/stage/3/puzzle/1?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "Jigsaw with anigif"

  Then I am on "http://studio.code.org/s/mc/stage/1/puzzle/4?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "minecraft top instructions"

  Then I am on "http://studio.code.org/s/starwars/stage/1/puzzle/15?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "starwars top instructions"

  Then I am on "http://studio.code.org/s/frozen/stage/1/puzzle/5?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "frozen top instructions"

  And execute JavaScript expression "window.localStorage.clear()"
  And I close my eyes
