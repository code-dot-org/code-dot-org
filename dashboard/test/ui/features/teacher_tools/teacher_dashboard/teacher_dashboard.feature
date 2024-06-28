@no_mobile
@eyes

Feature: Using the teacher dashboard

  Scenario: Teacher can view more tiles when clicking on view more button
    When I open my eyes to test "teacher dashboard"
    Given I create an authorized teacher-associated student named "Sally"

    When I sign in as "Teacher_Sally" and go home
    # Add new courses so new tiles are visible on the teacher dashboard
    And I create a new "Hour of Code" student section named "Section 1" assigned to "AI for Oceans"
    And I create a new "High School" student section named "Section 2" assigned to "Computer Science Principles" version "'17-'18"
    And I create a new "Hour of Code" student section named "Section 3" assigned to "Artist"
    And I create a new "Hour of Code" student section named "Section 4" assigned to "Classic Maze"
    And I create a new "Hour of Code" student section named "Section 5" assigned to "Flappy Code"
    And element ".ui-test-view-more-courses" is not visible
    And I see no difference for "5 course tiles"

    # Add one additional course so the View More button is visible
    And I create a new "Hour of Code" student section named "Section 6" assigned to "Disney Infinity Play Lab"
    And I see no difference for "view more button visible"

    And I click selector "button:contains(View more)"
    And I see no difference for "all tiles visible"

    And I wait for 30 seconds
    