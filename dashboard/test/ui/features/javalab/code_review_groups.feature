@no_mobile
Feature: Code Review Groups

  # to do
  # (x) make levelbuilder teacher so csa shows up in course list
  # (x) create a csa section
  # (x) create multiple students
  # (x) navigate to teacher dashboard, manage students
  # create a code review group
  # put a student in one of the groups
  # ...

  Scenario: Setting up groups
    Given I create a levelbuilder named "Dumbledore"
    When I sign in as "Dumbledore" and go home
    And I create a new section named "CSA Section" assigned to "CSA Pilot"
    And I save the section url
    And I save the section id from row 0 of the section table
    Given I create a student named "Hermione"
    And I join the section
    Given I create a student named "Harry"
    And I join the section
    When I sign in as "Dumbledore" and go home
    Then I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Manage Students)" once I see it
    And I click selector "#uitest-code-review-groups-button" once I see it
    # Sometimes this click isn't happening, waiting seems to make it more consistent
    And I wait for 2 seconds
    And I click selector "#uitest-create-code-review-group" once I see it
    # This isn't erroring (it did error before when it couldn't find the elements), but isn't dragging the elements either
    # And I drag "div[data-rbd-drag-handle-draggable-id]:first-child" to "div[data-rbd-droppable-id]:nth-child(2)"
    And I shift tab
    And I press keys ":tab"
    And I press keys ":space"
    And I press keys ":arrow_right"
    And I press keys ":space"
#    div[followerid="366"]
#    div[data-rbd-droppable-id="groupId171"]

    And I wait for 10 seconds