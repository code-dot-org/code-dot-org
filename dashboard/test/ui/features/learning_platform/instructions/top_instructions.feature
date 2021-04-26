@eyes
@as_student
Feature: Eyes Tests for Top Instructions

Scenario: CSF Top Instructions
  When I open my eyes to test "top instructions in CSF"
  And I am on "http://studio.code.org/s/course1/lessons/4/levels/11?noautoplay=true"
  And I wait for the page to fully load
  Then I see no difference for "maze short instructions"

  And I am on "http://studio.code.org/s/course4/lessons/3/levels/5?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "artist long instructions"
  Then I click selector ".uitest-scroll-button-down"
  And I see no difference for "artist long instructions"

  Then I am on "http://studio.code.org/s/allthethings/lessons/2/levels/7?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "maze short instructions with ani gif"

  Then I press "ani-gif-preview"
  And I see no difference for "maze ani gif dialog"

  Then I am on "http://studio.code.org/s/allthethings/lessons/6/levels/2?noautoplay=true"
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

  Then I am on "http://studio.code.org/s/course4/lessons/19/levels/3?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "Bee with starting hints"

  Then I am on "http://studio.code.org/s/course1/lessons/3/levels/1?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "Jigsaw with anigif"

  Then I am on "http://studio.code.org/s/mc/lessons/1/levels/4?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "minecraft top instructions"

  Then I am on "http://studio.code.org/s/starwars/lessons/1/levels/15?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "starwars top instructions"

  Then I am on "http://studio.code.org/s/frozen/lessons/1/levels/5?noautoplay=true"
  And I wait for the page to fully load
  And I see no difference for "frozen top instructions"

  And execute JavaScript expression "window.localStorage.clear()"
  And I close my eyes
