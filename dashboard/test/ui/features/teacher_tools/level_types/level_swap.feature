Feature: Swapped levels
  Scenario: Signed-out user sees active version
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/1"
    Then I wait until element ".instructions-markdown" contains text "Guide me to the green evilness!"
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/4"
    Then I wait until element ".standalone-video>h1" contains text "Video: Artist Intro"
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/5"
    Then I wait until element ".instructions-markdown" contains text "Now use a repeat block to make the cell a shell."

  @as_student
  Scenario: Signed-in student without progress sees active version
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/1"
    Then I wait until element ".instructions-markdown" contains text "Guide me to the green evilness!"
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/4"
    Then I wait until element ".standalone-video>h1" contains text "Video: Artist Intro"
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/5"
    Then I wait until element ".instructions-markdown" contains text "Now use a repeat block to make the cell a shell."

  @as_student
  Scenario: Student with progress sees old version
    Given I complete the level on "http://studio.code.org/s/allthethings/lessons/29/levels/1?level_name=2-3 Maze 1"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/29/levels/4?level_name=2-3 Artist 1 new"
    And I am on "http://studio.code.org/s/allthethings/lessons/29/levels/5?level_name=ramp_video_loopsArtist&noautoplay=true"
    And I wait until element ".submitButton" is visible
    When I click selector ".submitButton" to load a new page
    And I wait for the page to fully load
    Then I verify progress in the header of the current page is "perfect" for level 1
    And I verify the bubble for level 1 is an activity bubble
    And I verify progress in the header of the current page is "perfect" for level 4
    #And I verify the bubble for level 4 is an activity bubble
    And I verify progress in the header of the current page is "perfect" for level 5
    #And I verify the bubble for level 5 is a concept bubble
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/1"
    Then I wait until element ".instructions-markdown" contains text "Can you help me catch the naughty pig?"
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/4"
    Then I wait until element ".instructions-markdown" contains text "Hi, I'm an artist."
    When I am on "http://studio.code.org/s/allthethings/lessons/29/levels/5"
    Then I wait until element ".standalone-video>h1" contains text "Video: Artist Loops"
